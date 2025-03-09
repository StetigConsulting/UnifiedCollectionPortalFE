"use server";

import { AuthError } from 'next-auth';
import { signIn, signOut } from '../auth';

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
    await signOut({
        redirectTo: '/auth/signin',
        redirect: true,
    });

}