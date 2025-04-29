// src/app/api/otp/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { mobileNumber, otp } = await req.json();

    try {
        const apiResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL_V2_BACKEND}/v1/auth/authenticate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mobile_number: mobileNumber,
                    otp,
                }),
            }
        );

        const result = await apiResponse.json();

        if (apiResponse.ok) {
            return NextResponse.json({ message: 'OTP validated successfully', data: result });
        } else {
            return NextResponse.json(
                { message: result.error || 'OTP validation failed' },
                { status: apiResponse.status }
            );
        }
    } catch (error) {
        console.error('Error validating OTP:', error);
        return NextResponse.json({ message: 'Error validating OTP' }, { status: 500 });
    }
}