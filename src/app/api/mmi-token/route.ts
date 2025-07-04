// pages/api/get-token.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    if (req.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
    }

    const url = process.env.MMI_TOKENURL;

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', process.env.MMI_USERNAME);
    params.append('password', process.env.MMI_PASSWORD);
    params.append('client_id', process.env.MMI_CLIENT_ID);
    params.append('client_secret', process.env.MMI_CLIENT_SECRET);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error_description }, { status: 400 })
        }

        return NextResponse.json({ ...data }, { status: response.status });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server Error' }, { status: 500 });
    }
}
