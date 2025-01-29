import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb'
import { Separator } from './ui/separator'
import { SidebarTrigger } from './ui/sidebar'
import { LogOut } from 'lucide-react';
import { handleSignOut } from '@/app/actions/authActions';
import { Button } from './ui/button';

interface CustomBreadcrumbProps {
    pageTitle: string;
    children: React.ReactNode
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({ pageTitle, children }) => {

    const onSignOut = async (event: React.MouseEvent) => {
        event.preventDefault();
        await handleSignOut();
    };

    return (
        <div className='flex flex-col h-screen'>
            <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Button
                    data-sidebar="trigger"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onSignOut}
                >
                    <LogOut size={16} className='cursor-pointer' />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>

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
            <header className="p-4">
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
            </header>
            <div className="flex-1 overflow-auto p-4 pt-0">
                <div className='bg-lightThemeColor'
                    style={{ backgroundColor: '#80808021', padding: '15px' }}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}

export default CustomBreadcrumb