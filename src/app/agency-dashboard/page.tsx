"use client";

import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { useState } from "react";

const AgencyDashboard = () => {

    const [isloading, setIsloading] = useState(false)
    const [isSubmitting, setIsSubmiting] = useState(false)

    return (
        <AuthUserReusableCode pageTitle="Dashboard" isLoading={isloading || isSubmitting}>
            <></>
        </AuthUserReusableCode>
    );
};

export default AgencyDashboard;
