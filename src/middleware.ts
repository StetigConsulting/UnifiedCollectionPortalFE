import { NextResponse } from "next/server";
import { auth } from "./app/auth";
import {
    SIGNIN,
    ROOT
} from "./lib/utils";

export async function middleware(request: any) {

    const { nextUrl } = request;
    const session = await auth();
    const isAuthenticated = !!session?.user;

    console.log("Is Authenticated:", isAuthenticated);

    if (!isAuthenticated) {
        if (nextUrl.pathname !== SIGNIN) {
            return NextResponse.redirect(new URL(SIGNIN, nextUrl));
        }
    } else {
        if (nextUrl.pathname === SIGNIN) {
            return NextResponse.redirect(new URL(ROOT, nextUrl));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api/|_next/static|_next/image|favicon.ico|icon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
    ],
};
