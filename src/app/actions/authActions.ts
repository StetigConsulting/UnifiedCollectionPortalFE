"use server";

import { AuthError } from 'next-auth';
import { auth, signIn, signOut } from '../auth';

export async function handleCredentialsSignin({ access_token, expires_in, refresh_token }: {
    access_token: string,
    expires_in: number,
    refresh_token: string
}) {
    try {
        const result = await signIn("credentials", { access_token, expires_in, refresh_token, redirect: false });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return {
                        message: 'Invalid credentials',
                    }
                default:
                    return {
                        message: 'Something went wrong.',
                    }
            }
        }
        throw error;
    }
}

export async function handleSignOut() {

    const session = await auth();
    const accessToken = session?.user?.accessToken;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2_BACKEND}/v1/auth/logout`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    });

    // if (response.ok) {
    //     console.error("Logout API failed:", response.statusText);
    //     return { message: "Failed to log out. Please try again." };
    // }

    await signOut({
        redirectTo: '/auth/signin',
        redirect: true,
    });

}