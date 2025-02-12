"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUserStore } from "./store";

export default function HydrateAuth() {
    // const { data: session } = useSession();
    // const setUserData = useUserStore((state) => state.setUserData);

    // useEffect(() => {
    //     if (session?.user) {
    //         setUserData(session.user);
    //     }
    // }, [session, setUserData]);

    // return null;
}
