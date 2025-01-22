import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb'
import { Separator } from './ui/separator'
import { SidebarTrigger } from './ui/sidebar'
import { LogOut } from 'lucide-react';

interface CustomBreadcrumbProps {
    pageTitle: string;
    children: React.ReactNode
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({ pageTitle, children }) => {
    return (
        <>
            <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <LogOut />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb className='ml-auto'>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="#">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <div className="flex flex-col gap-4 p-4">
                <header className="">
                    <h1 className="text-2xl font-bold">{pageTitle}</h1>
                </header>
                <div style={{ backgroundColor: '#80808021', padding: '15px' }}>
                    {children}
                </div>
            </div>
        </>
    )
}

export default CustomBreadcrumb