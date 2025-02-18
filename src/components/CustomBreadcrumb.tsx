import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb'
import { Separator } from './ui/separator'
import { SidebarTrigger } from './ui/sidebar'
import { LogOut, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { usePathname } from 'next/navigation';
import { getTitleByUrl } from '@/lib/utils';

interface CustomBreadcrumbProps {
    pageTitle: string;
    children: React.ReactNode,
    onSignOut: (event: React.MouseEvent) => Promise<void>;
    agencyBalanceDetail: any;
    blacklist?: string[];
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
    pageTitle, children, onSignOut, agencyBalanceDetail,
    blacklist = ["agency", 'dashboard', 'admin', 'department']
}) => {
    const router = usePathname();
    const pathSegments = router.split("/").filter((seg) => seg !== "");

    // const filteredSegments = pathSegments.filter((segment) => !blacklist.includes(segment));

    const breadcrumbLinks = pathSegments.map((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/");
        const isLast = index === pathSegments.length - 1;

        return blacklist.includes(segment) ? null : (
            <React.Fragment key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    {isLast ? (
                        <BreadcrumbPage className='capitalize'>{getTitleByUrl(router)}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink className='capitalize' href={href}>{getTitleByUrl(segment)}</BreadcrumbLink>
                    )}
                </BreadcrumbItem>

            </React.Fragment>
        );
    });
    return (
        <div className='flex flex-col h-screen bg-lightThemeColor p-2'>
            <Card className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Button
                    data-sidebar="trigger"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onSignOut}
                >
                    <LogOut size={16} className='cursor-pointer' />
                    <span className="sr-only">Log Out</span>
                </Button>

                <Separator orientation="vertical" className="mr-2 h-4" />
                {agencyBalanceDetail?.agencyBalance &&
                    <>
                        <div className='flex gap-4'>
                            <div className='flex gap-4'>
                                <Wallet />
                                <p className="text-lg font-bold text-red-500">
                                    {agencyBalanceDetail?.agencyBalance}
                                </p>
                            </div>
                            <div className='flex gap-4'>
                                <Wallet />
                                <p className="text-lg font-bold text-red-500">
                                    {agencyBalanceDetail?.agentWalletBalance}
                                </p>
                            </div>
                            <div className='flex gap-4'>
                                <Wallet />
                                <p className="text-lg font-bold text-green-500">
                                    {agencyBalanceDetail?.rechargeableAgentWalletBalance}
                                </p>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </>
                }
                <Breadcrumb className='ml-auto'>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        {breadcrumbLinks}
                    </BreadcrumbList>
                </Breadcrumb>
            </Card >
            <header className="p-4 bg-lightThemeColor">
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
            </header>
            <Card className="flex-1 overflow-auto p-4"
            // style={{ backgroundColor: '#80808021' }}
            >
                {children}
            </Card>
        </div >
    )
}

export default CustomBreadcrumb