import React from 'react'
import { SidebarInset, SidebarProvider } from './ui/sidebar'
import { AppSidebar } from './AppSidebar'
import CustomBreadcrumb from './CustomBreadcrumb'
import { InfinitySpin } from 'react-loader-spinner'

interface AuthUserReusableCodeProps {
    children: React.ReactNode;
    pageTitle: string;
    isLoading?: boolean;
}

function AuthUserReusableCode({ children, pageTitle, isLoading = false }: AuthUserReusableCodeProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            {isLoading &&
                <div className="absolute inset-0 flex items-center justify-center z-50"
                    style={{
                        backdropFilter: 'blur(1px)'
                    }}>
                    <InfinitySpin
                        width="200"
                        color="#18181b"
                    />
                </div>
            }
            <SidebarInset>
                <CustomBreadcrumb pageTitle={pageTitle}>
                    {children}
                </CustomBreadcrumb>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default AuthUserReusableCode