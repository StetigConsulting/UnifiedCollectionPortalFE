// src/app/api/otp/generate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { mobileNumber } = await req.json();

  try {
    const apiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/auth/send-otp/${mobileNumber}`,
      {
        method: "GET",
      }
    );

    const result = await apiResponse.json();

    if (apiResponse.ok) {
      return NextResponse.json({
        message: "OTP sent successfully",
        data: result,
      });
    } else {
      return NextResponse.json(
        { message: result.error || "OTP Send failed" },
        { status: apiResponse.status }
      );
    }
  } catch (error) {
    console.error("Error during OTP API call:", error);
    return NextResponse.json(
      { message: "Failed to request OTP" },
      { status: 500 }
    );
  }
}
