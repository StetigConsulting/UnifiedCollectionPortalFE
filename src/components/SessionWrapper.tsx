"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import Loading from "@/app/loading";

export default function SessionWrapper({ children }: { children: ReactNode }) {
    const { status } = useSession();

    if (status === "loading") {
        return <Loading />; // Show a global loading screen until session loads
    }

    return <>{children}</>;
}
