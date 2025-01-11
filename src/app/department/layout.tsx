'use client'

import AuthUserReusableCode from '@/components/AuthUserReusableCode'
import React, { useEffect } from 'react'
import { usePathname } from "next/navigation";
import { getTitleByUrl } from '@/components/AppSidebar';

const DepartmentLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {

    const pathname = usePathname();

    let title = (typeof window !== 'undefined') && getTitleByUrl(pathname)

    return (
        <AuthUserReusableCode pageTitle={title}>
            {children}
        </AuthUserReusableCode>
    )
}

export default DepartmentLayout