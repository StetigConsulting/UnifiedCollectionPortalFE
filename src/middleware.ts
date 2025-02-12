import { NextResponse } from "next/server";
import { auth } from "./app/auth";
import {
    SUPER_ADMIN_ONLY_ROUTES,
    ADMIN_ONLY_ROUTES,
    AGENCY_ONLY_ROUTES,
    SIGNIN
} from "./lib/utils";

export async function middleware(request: any) {
    console.log("Middleware Running");

    const { nextUrl } = request;
    const session = await auth();
    const userRole = session?.user?.userRole;
    const isAuthenticated = !!session?.user;

    console.log("Session User Role:", userRole);
    console.log("Is Authenticated:", isAuthenticated);

    if (!isAuthenticated) {
        if (nextUrl.pathname !== SIGNIN) {
            return NextResponse.redirect(new URL(SIGNIN, nextUrl));
        }
        return NextResponse.next();
    }

    if (nextUrl.pathname === "/dashboard") {
        return NextResponse.next();
    }

    if (userRole === "SUPER ADMIN") {
        if (ADMIN_ONLY_ROUTES.includes(nextUrl.pathname) || AGENCY_ONLY_ROUTES.includes(nextUrl.pathname)) {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
    } else if (userRole === "ADMIN") {
        if (SUPER_ADMIN_ONLY_ROUTES.includes(nextUrl.pathname) || AGENCY_ONLY_ROUTES.includes(nextUrl.pathname)) {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
    } else if (userRole === "AGENT") {
        if (SUPER_ADMIN_ONLY_ROUTES.includes(nextUrl.pathname) || ADMIN_ONLY_ROUTES.includes(nextUrl.pathname)) {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
    }

    return NextResponse.next();
}

// Middleware configuration
export const config = {
    matcher: [
        "/((?!api/|_next/static|_next/image|favicon.ico|icon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
    ],
};
