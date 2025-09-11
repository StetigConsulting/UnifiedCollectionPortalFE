import { handleCredentialsSignin } from "@/app/actions/authActions";
import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { getAccessToken, getRefreshToken, clearCache, setTokens } from "./token-manager";
import { clientLogout } from "./logout-utils";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL_FRONTEND,
    headers: {
        "Content-Type": "application/json",
    },
});

// Function to refresh token
const refreshAccessToken = async (refreshToken: string) => {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL_FRONTEND}/v1/auth/refresh-token`, {
            grant_type: "refresh",
            refresh_token: refreshToken,
        });

        const refreshedTokens = response.data?.data;

        if (!response.data || !refreshedTokens?.access_token) {
            throw new Error("Failed to refresh token");
        }
        await handleCredentialsSignin({
            access_token: refreshedTokens.access_token,
            refresh_token: refreshedTokens.refresh_token ?? refreshToken,
            expires_in: refreshedTokens.expires_in,
        });


        return {
            accessToken: refreshedTokens.access_token,
            refreshToken: refreshedTokens.refresh_token ?? refreshToken,
            tokenExpiry: Date.now() + refreshedTokens.expires_in,
        };
    } catch (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem('csrf_token');
            // await signOut();
        } else {
            console.error("Error refreshing access token:", error);
        }
        return null;
    }
};
// const handleSignOut = async () => {
//     await signOut({ redirect: false }); // Do not redirect automatically
//     // Clear CSRF token and handle logout UI
//     localStorage.removeItem('csrf_token');
//     Router.push('/'); // Redirect to homepage using Next.js router
// };


api.interceptors.request.use(
    async (config) => {
        // Use cached token instead of calling getSession()
        const accessToken = getAccessToken();
        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        } else {
            // Only call getSession() if cache is empty (fallback)
            const session = await getSession();
            if (session && session.user.accessToken) {
                config.headers["Authorization"] = `Bearer ${session.user.accessToken}`;
                // Update cache with session data
                setTokens(
                    session.user.accessToken,
                    session.user.refreshToken,
                    session.user.tokenExpiry || (Date.now() + 60 * 60 * 1000)
                );
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Use cached refresh token instead of calling getSession()
                const refreshToken = getRefreshToken();
                
                if (!refreshToken) {
                    // Fallback to session if cache is empty
                    const session = await getSession();
                    if (!session?.user?.refreshToken) {
                        throw new Error("No refresh token available");
                    }
                    const newTokens = await refreshAccessToken(session.user.refreshToken);
                    if (newTokens) {
                        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                        return api(originalRequest);
                    }
                } else {
                    const newTokens = await refreshAccessToken(refreshToken);
                    if (newTokens) {
                        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                        return api(originalRequest);
                    }
                }
                
                throw new Error("Failed to refresh token");
            } catch (refreshError) {
                toast.error("Your session has expired. Please log in again.");
                await clientLogout(false);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;