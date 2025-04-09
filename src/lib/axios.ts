import { handleCredentialsSignin } from "@/app/actions/authActions";
import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { Router } from "next/router";
import { toast } from "sonner";
import { backendUrl } from "./utils";

const api = axios.create({
    baseURL: backendUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// Function to refresh token
const refreshAccessToken = async (refreshToken: string) => {
    try {
        const response = await axios.post(`${backendUrl}/v1/auth/refresh-token`, {
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
            tokenExpiry: refreshedTokens.expires_in,
        };
    } catch (error) {
        if (error.response?.status === 401) {
            console.error("Refresh token expired, logging out...");
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
        const session = await getSession();
        if (session && session.user.accessToken) {
            config.headers["Authorization"] = `Bearer ${session.user.accessToken}`;
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
                const session = await getSession();

                const newTokens = await refreshAccessToken(session?.user?.refreshToken);

                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error("Token refresh failed, logging out...");
                toast.error("Your session has expired. Please log in again.");
                await signOut();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;