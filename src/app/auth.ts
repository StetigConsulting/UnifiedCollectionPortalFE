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
    tokenExpiry?: number;
}

async function refreshAccessToken(token: any) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grant_type: 'refresh', refresh_token: token.refreshToken }),
        });

        console.log('refreshing', response)

        const data = await response.json();

        if (!response.ok) throw new Error("Failed to refresh token");

        return {
            ...token,
            accessToken: data.data.access_token,
            refreshToken: data.data.refresh_token,
            tokenExpiry: Date.now() / 1000 + data.data.expires_in / 1000,
        };
    } catch (error) {
        console.error("Token refresh failed:", error);
        return { ...token, accessToken: null };
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                mobileNumber: { label: "Mobile", type: "text", placeholder: "Mobile Number" },
                otp: { label: "OTP", type: "text", placeholder: "OTP" }
            },
            async authorize(credentials): Promise<ExtendedUser | null> {

                const mobileNumber = credentials?.mobileNumber as string;
                const otp = credentials?.otp as string;

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/auth/authenticate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        mobile_number: mobileNumber,
                        otp,
                    }),
                });

                const data = await response.json();
                console.log("Authenticate Response", response, data);

                if (!response.ok || !data?.data?.access_token) {
                    return null;
                }

                const user: ExtendedUser = {
                    id: null,
                    mobileNumber: mobileNumber,
                    userId: null,
                    // userId: 6,
                    accessToken: data.data.access_token,
                    refreshToken: data.data.refresh_token,
                    discomId: null,
                    roleId: null,
                    userRole: "UNKNOWN",
                    userScopes: [],
                    tokenExpiry: data.data.expires_in
                };

                try {

                    const userRoleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/tp-users/user-info`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${user.accessToken}`,
                            "Content-Type": "application/json"
                        }
                    });

                    if (userRoleResponse.ok) {
                        const roleData = await userRoleResponse.json();
                        console.log("User Role Response:", roleData);
                        user.id = String(roleData?.data?.id);
                        user.userId = parseInt(roleData?.data?.id);
                        user.discomId = roleData?.data?.discom_id;
                        user.userRole = roleData?.data?.user_role?.role_name || "UNKNOWN";
                        user.userScopes = roleData?.data?.user_scopes?.map((scope: { user_scope: string }) => scope.user_scope) || [];
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
    trustHost: true,
    session: {
        strategy: 'jwt'
    },
    jwt: { maxAge: 2 * 60 * 60 },
    pages: {
        signIn: "/auth/signin",
    },
});
