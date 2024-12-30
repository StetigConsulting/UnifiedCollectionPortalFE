"use server";

import { AuthError } from 'next-auth';
import { signIn, signOut } from '../auth';

export async function handleCredentialsSignin({ mobileNumber, otp }: {
    otp: string,
    mobileNumber: string
}) {
    try {
        await signIn("credentials", { mobileNumber, otp, redirectTo: "/dashboard" });
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