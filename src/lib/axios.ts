import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL_V2,
    headers: {
        "Content-Type": "application/json",
    },
});

// Function to refresh token
const refreshAccessToken = async (refreshToken: string) => {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/auth/refresh-token`, {
            grant_type: "refresh",
            refresh_token: refreshToken,
        });

        const refreshedTokens = response.data?.data;

        if (!response.data || !refreshedTokens?.access_token) {
            throw new Error("Failed to refresh token");
        }

        return {
            accessToken: refreshedTokens.access_token,
            refreshToken: refreshedTokens.refresh_token ?? refreshToken,
            tokenExpiry: Date.now() + refreshedTokens.expires_in,
        };
    } catch (error) {
        if (error.response?.status === 401) {
            console.error("Refresh token expired, logging out...");
            await signOut();
        } else {
            console.error("Error refreshing access token:", error);
        }
        return null;
    }
};

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

                if (!session?.user?.refreshToken) {
                    console.error("No refresh token found, logging out...");
                    await signOut();
                    return Promise.reject(error);
                }

                const newTokens = await refreshAccessToken(session.user.refreshToken);

                if (!newTokens) {
                    console.error("Failed to refresh token, logging out...");
                    await signOut();
                    return Promise.reject(error);
                }

                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error("Token refresh failed, logging out...");
                await signOut();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
