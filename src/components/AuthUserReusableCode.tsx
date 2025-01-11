import React from 'react'
import { SidebarInset, SidebarProvider } from './ui/sidebar'
import { AppSidebar } from './AppSidebar'
import CustomBreadcrumb from './CustomBreadcrumb'

interface AuthUserReusableCodeProps {
    children: React.ReactNode;
    pageTitle: string;
}

function AuthUserReusableCode({ children, pageTitle }: AuthUserReusableCodeProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <CustomBreadcrumb pageTitle={pageTitle}>
                    {children}
                </CustomBreadcrumb>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default AuthUserReusableCode