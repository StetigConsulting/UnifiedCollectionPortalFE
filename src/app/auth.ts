import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";

interface ExtendedUser extends User {
    id: string;
    mobileNumber: string;
    userId: number;
    accessToken: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                mobileNumber: { label: "Mobile", type: "text", placeholder: "Mobile Number" },
                otp: { label: "OTP", type: "text", placeholder: "OTP" }
            },
            async authorize(credentials): Promise<ExtendedUser | null> {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                const publicIp = ipData.ip;

                const mobileNumber = credentials?.mobileNumber as string;
                const otp = credentials?.otp as string;

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/authenticate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        mobileNumber: mobileNumber, 
                        otp,
                        "ipAddress": publicIp,
                        "sourceType": "PORTAL"
                    }),
                });

                const data = await response.json();
                console.log("Authenticate Response", response);
                if (response.ok && data?.data?.accessToken) {
                    return {
                        id: data.data.userId,
                        mobileNumber: mobileNumber,
                        userId: data.data.userId,
                        accessToken: data.data.accessToken,
                    };
                }
                return null;
            }
        })
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                console.log("JWT User:", user)
                token.id = user.id;
                token.mobileNumber = user.mobileNumber;
                token.userId = user.userId;
                token.accessToken = user.accessToken;
            }
            return token;
        },
        session({ session, token }) {
            session.user.id = token.id as string;
            session.user.mobileNumber = token.mobileNumber as string;
            session.user.userId = token.userId as number;
            session.user.accessToken = token.accessToken as string;
            return session;
        }
        
    },
    pages: {
        signIn: "/auth/signin"
    }
});