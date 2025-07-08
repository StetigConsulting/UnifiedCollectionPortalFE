import { NextResponse } from "next/server";
import { auth } from "./app/auth";
import {
    SIGNIN,
    urlsListWithTitle
} from "./lib/utils";
import { checkIfUserHasAccessToPage, checkIfUserHasActionAccess, getLandingPageUrl } from "./helper";

export async function middleware(request: any) {

    const { nextUrl } = request;
    const session = await auth();
    const isAuthenticated = !!session?.user;
    let landingPage = getLandingPageUrl(session?.user?.userScopes)

    if (nextUrl.pathname === '/debug-env') {
        return NextResponse.next();
    }

    // if (nextUrl.pathname === '/') {
    //     return NextResponse.redirect(new URL(SIGNIN, nextUrl));
    // }

    if (!isAuthenticated) {
        if (nextUrl.pathname !== SIGNIN) {
            return NextResponse.redirect(new URL(SIGNIN, nextUrl));
        }
    } else {
        // if (nextUrl.pathname.split('?')?.[0] === urlsListWithTitle.dashboard.url) {
        //     ['dashboardBillUploadHistory', 'dashboardTransactionSummary', 'dashboardPerformanceSummary'].forEach((action) => {
        //         const hasAccess = checkIfUserHasActionAccess({
        //             backendScope: session?.user?.userScopes,
        //             currentAction: action,
        //         });
        //         if (hasAccess) return NextResponse.next();
        //     })
        // } else {
        //     if (!checkIfUserHasAccessToPage({ backendScope: session?.user?.userScopes, currentUrl: nextUrl.pathname.split('?')?.[0] })) {
        //         return NextResponse.redirect(new URL(landingPage, nextUrl));
        //     }
        // }

        if (nextUrl.pathname === SIGNIN) {
            return NextResponse.redirect(new URL(landingPage, nextUrl));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api/|_next/static|_next/image|favicon.ico|icon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
    ],
};
