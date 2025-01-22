// export { auth as middleware } from '@/app/auth';
console.log("Middleware");

import { NextResponse } from "next/server";
import { auth } from "./app/auth";
import { PROTECTED_SUB_ROUTES, PUBLIC_ROUTES, SIGNIN } from "./lib/utils";

export async function middleware(request: any) {
    const { nextUrl } = request;

    // const session = await auth();
    // console.log("Session is", session?.user);
    // const isAuthenticated = !!session?.user;
    // console.log(isAuthenticated);

    // const isPublicRoute = (
    //     PUBLIC_ROUTES.find(route => nextUrl.pathname.startsWith(route)) &&
    //     !PROTECTED_SUB_ROUTES.find(
    //         route => nextUrl.pathname.includes(route)
    //     )
    // )

    // console.log(isPublicRoute);

    // if (!isAuthenticated && !isPublicRoute) {
    //     return NextResponse.redirect(new URL(SIGNIN, nextUrl));
    // }
    console.log(nextUrl);
    if (nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL(SIGNIN, nextUrl));
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};