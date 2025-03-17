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

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                access_token: { label: "Access Token", type: "text" },
                refresh_token: { label: "Refresh Token", type: "text" },
                expires_in: { label: "Token Expiry", type: "text" }
            },
            async authorize(credentials): Promise<ExtendedUser | null> {
                if (!credentials) return null;

                const user: ExtendedUser = {
                    id: "",
                    userId: 0,
                    mobileNumber: '',
                    accessToken: String(credentials.access_token),
                    refreshToken: String(credentials.refresh_token),
                    discomId: 0,
                    roleId: 0,
                    userRole: "UNKNOWN",
                    userScopes: [],
                    tokenExpiry: Date.now() + Number(credentials.expires_in),
                    // tokenExpiry: Date.now() + 1 * 60 * 1000,
                };

                console.log(Date.now(), Date.now() + Number(credentials.expires_in))

                try {
                    const userRoleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/tp-users/user-info`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${user.accessToken}`,
                            "Content-Type": "application/json"
                        }
                    });

                    console.log('userRoleResponse', userRoleResponse)

                    if (userRoleResponse.ok) {
                        const roleData = await userRoleResponse.json();
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
                token.id = user.id;
                token.mobileNumber = user.mobileNumber;
                token.userId = user.userId;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.discomId = user.discomId;
                token.roleId = user.roleId;
                token.userRole = user.userRole;
                token.userScopes = user.userScopes;
                token.tokenExpiry = user.tokenExpiry
            }

            if (token.error === "RefreshAccessTokenError") {
                return null;
            }

            const tokenExpiry = token.tokenExpiry as number;

            if (Date.now() < tokenExpiry) {
                console.log(Date.now(), tokenExpiry)
                return token;
            }

            return await refreshAccessToken(token);
        },
        async session({ session, token }) {
            if (!token || !token.accessToken) {
                console.log("Session expired, logging out...");
                return null;
            }
            session.user.id = token.id as string;
            session.user.mobileNumber = token.mobileNumber as string;
            session.user.userId = token.userId as number;
            session.user.accessToken = token.accessToken as string;
            session.user.refreshToken = token.refreshToken as string;
            session.user.discomId = token.discomId as number;
            session.user.roleId = token.roleId as number;
            session.user.userRole = token.userRole as string;
            session.user.userScopes = token.userScopes as string[];
            session.user.tokenExpiry = token.tokenExpiry as number;
            return session;
        },
    },
    trustHost: true,
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: "/auth/signin",
    },
});

async function refreshAccessToken(token) {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/auth/refresh-token`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grant_type: "refresh",
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        // console.log('token tefff', refreshedTokens)

        if (response.status === 401) {
            console.error("Refresh token expired, logging out user.");
            return {
                ...token,
                error: "RefreshAccessTokenError",
                accessToken: null,
                refreshToken: null,
            };
        }

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens?.data?.access_token,
            refreshToken: refreshedTokens?.data?.refresh_token ?? token.refreshToken,
            tokenExpiry: Date.now() + (refreshedTokens?.data?.expires_in),
        };
    } catch (error) {
        console.error('Error refreshing access token', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}