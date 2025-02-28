import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";

interface ExtendedUser extends User {
    id: string;
    mobileNumber: string;
    userId: number;
    accessToken: string;
    refreshToken: string;
    discomId: number;
    roleId: number;
    userRole?: string;
    userScopes?: string[];
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                mobileNumber: { label: "Mobile", type: "text", placeholder: "Mobile Number" },
                otp: { label: "OTP", type: "text", placeholder: "OTP" }
            },
            async authorize(credentials): Promise<ExtendedUser | null> {
                const ipResponse = await fetch("https://api.ipify.org?format=json");
                const ipData = await ipResponse.json();
                const publicIp = ipData.ip;

                const mobileNumber = credentials?.mobileNumber as string;
                const otp = credentials?.otp as string;


                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/authenticate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        mobileNumber: mobileNumber,
                        otp,
                        ipAddress: publicIp,
                        sourceType: "PORTAL",
                    }),
                });

                const data = await response.json();
                console.log("Authenticate Response", response, data);

                if (!response.ok || !data?.data?.accessToken) {
                    return null;
                }


                const user: ExtendedUser = {
                    id: data.data.userId,
                    mobileNumber: mobileNumber,
                    userId: data.data.userId,
                    // userId: 6,
                    accessToken: data.data.accessToken,
                    refreshToken: data.data.refreshToken,
                    discomId: data.data.discomId,
                    roleId: data.data.roleId,
                    userRole: "UNKNOWN",
                    userScopes: [],
                };

                try {

                    const userRoleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/user-role-scopes/${user.roleId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${user.accessToken}`,
                            "Content-Type": "application/json"
                        }
                    });

                    if (userRoleResponse.ok) {
                        const roleData = await userRoleResponse.json();
                        console.log("User Role Response:", roleData.user_scopes);
                        user.userRole = roleData?.data?.user_role?.role_name || "UNKNOWN";
                        user.userScopes = roleData?.data?.user_scopes?.map((scope: { action: string }) => scope.action) || [];
                    } else {
                        console.error("Failed to fetch user role", userRoleResponse.statusText);
                    }
                } catch (error) {
                    console.error("Error fetching user role", error);
                }

                return user;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                console.log("JWT User:", user);
                token.id = user.id;
                token.mobileNumber = user.mobileNumber;
                token.userId = user.userId;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.discomId = user.discomId;
                token.roleId = user.roleId;
                token.userRole = user.userRole;
                token.userScopes = user.userScopes;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.mobileNumber = token.mobileNumber as string;
            session.user.userId = token.userId as number;
            session.user.accessToken = token.accessToken as string;
            session.user.refreshToken = token.refreshToken as string;
            session.user.discomId = token.discomId as number;
            session.user.roleId = token.roleId as number;
            session.user.userRole = token.userRole as string;
            session.user.userScopes = token.userScopes as string[];
            return session;
        },
    },
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: "/auth/signin",
    },
});
