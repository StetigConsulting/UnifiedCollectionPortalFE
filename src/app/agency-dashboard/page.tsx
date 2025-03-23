"use client";

import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { useState } from "react";

const AgencyDashboard = () => {

    const [isloading, setIsloading] = useState(false)
    const [isSubmitting, setIsSubmiting] = useState(false)

    return (
        <AuthUserReusableCode pageTitle="Dashboard" isLoading={isloading || isSubmitting}>
            <p className="mb-4">Quick Links</p>
            <p>Closing (Jun 1 2024 12:00 PM) - Please ensure 100% sync out.</p>
        </AuthUserReusableCode>
    );
};

export default AgencyDashboard;
