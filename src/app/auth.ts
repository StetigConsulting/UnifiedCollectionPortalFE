import { useUserStore } from "@/store/store";
import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";

interface ExtendedUser extends User {
    id: string;
    mobileNumber: string;
    name: string;
    userId: string;
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
                userData: { label: "User Data", type: "text", placeholder: "Pass User Data as JSON" },
            },
            async authorize(credentials): Promise<ExtendedUser | null> {
                if (!credentials?.userData) return null;

                try {
                    const user: ExtendedUser = JSON.parse(credentials.userData);

                    const userRoleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/user-role-scopes/${user.roleId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${user.accessToken}`,
                            "Content-Type": "application/json"
                        },
                    });

                    if (userRoleResponse.ok) {
                        const roleData = await userRoleResponse.json();
                        console.log("User Role Response:", roleData);
                        user.userRole = roleData?.data?.user_role?.role_name || "UNKNOWN";
                        user.userScopes = roleData?.data?.user_scopes?.map((scope: { action: string }) => scope.action) || [];
                    } else {
                        console.error("Failed to fetch user role:", userRoleResponse.statusText);
                    }

                    return user;
                } catch (error) {
                    console.error("Error in authentication:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.mobileNumber = user.mobileNumber;
                token.name = user.name;
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
            session.user.name = token.name as string;
            session.user.userId = token.userId as string;
            session.user.accessToken = token.accessToken as string;
            session.user.refreshToken = token.refreshToken as string;
            session.user.discomId = token.discomId as number;
            session.user.roleId = token.roleId as number;
            session.user.userRole = token.userRole as string;
            session.user.userScopes = token.userScopes as string[];

            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
});
