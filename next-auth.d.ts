// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            userName: string;
            userId: number;
            accessToken: string;
            refreshToken: string;
            discomId: number;
            roleId: number;
            lastLoginAt?: string;
            userScopes?: string[];
            tokenExpiry?: number;
        };
    }

    interface User {
        id: string;
        userName: string;
        userId: number;
        accessToken: string;
        refreshToken: string;
        discomId: number;
        roleId: number;
        lastLoginAt?: string;
        userScopes?: string[];
        tokenExpiry?: number;
    }

    interface JWT {
        id: string;
        userName: string;
        userId: number;
        accessToken: string;
        refreshToken: string;
        discomId: number;
        roleId: number;
        lastLoginAt?: string;
        userScopes?: string[];
        tokenExpiry?: number;
    }
}
