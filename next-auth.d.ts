// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            mobileNumber: string;
            name: string;
            userId: number;
            accessToken: string;
        };
    }

    interface User {
        id: string;
        mobileNumber: string;
        name: string;
        userId: number;
        accessToken: string;
    }

    interface JWT {
        id: string;
        mobileNumber: string;
        name: string;
        userId: number;
        accessToken: string;
    }
}