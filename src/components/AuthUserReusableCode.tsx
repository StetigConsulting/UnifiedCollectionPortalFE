import React from 'react'
import { SidebarInset, SidebarProvider } from './ui/sidebar'
import { AppSidebar } from './AppSidebar'
import CustomBreadcrumb from './CustomBreadcrumb'
import Image from 'next/image'

interface AuthUserReusableCodeProps {
    children: React.ReactNode;
    pageTitle: string;
    isLoading?: boolean;
}

function AuthUserReusableCode({ children, pageTitle, isLoading = false }: AuthUserReusableCodeProps) {
    return (
        <SidebarProvider style={{
            display: '-webkit-box',
            boxSizing: 'border-box'
        }}>
            <AppSidebar />
            {
                isLoading &&
                <div className="absolute inset-0 flex items-center justify-center z-50"
                    style={{
                        backdropFilter: 'blur(1px)'
                    }}>
                    <Image alt=""
                        width={150}
                        height={1000}
                        unoptimized
                        className="mx-auto object-contain"
                        src='/images/loader.gif' />
                </div>
            }
            <SidebarInset className='flex-1' style={{ WebkitBoxFlex: 1 }}>
                <CustomBreadcrumb pageTitle={pageTitle}>
                    {children}
                </CustomBreadcrumb>
            </SidebarInset>
        </SidebarProvider >
    )
}

export default AuthUserReusableCode