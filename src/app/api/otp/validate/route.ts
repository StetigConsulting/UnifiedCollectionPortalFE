// src/app/api/otp/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { mobileNumber, otp: enteredOtp } = await req.json();

    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const publicIp = ipData.ip;

        console.log(publicIp);

        const apiResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/authenticate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mobileNumber: mobileNumber,
                    otp: enteredOtp,
                    "ipAddress": publicIp,
                    "sourceType": "PORTAL"
                }),
            }
        );

        const result = await apiResponse.json();

        if (apiResponse.ok) {
            return NextResponse.json({ message: 'OTP validated successfully', data: result });
        } else {
            return NextResponse.json(
                { message: result.message || 'OTP validation failed' },
                { status: apiResponse.status }
            );
        }
    } catch (error) {
        console.error('Error validating OTP:', error);
        return NextResponse.json({ message: 'Error validating OTP' }, { status: 500 });
    }
}