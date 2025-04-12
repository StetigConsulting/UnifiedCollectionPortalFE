import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb'
import { Separator } from './ui/separator'
import { SidebarTrigger } from './ui/sidebar'
import { LogOut, User, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { usePathname, useSearchParams } from 'next/navigation';
import { getTitleByUrl, urlsListWithTitle } from '@/lib/utils';
import moment from 'moment';
import { checkIfUserHasAccessToPage } from '@/helper';

interface CustomBreadcrumbProps {
    pageTitle: string;
    children: React.ReactNode,
    onSignOut: (event: React.MouseEvent) => Promise<void>;
    agencyBalanceDetail: any;
    blacklist?: string[];
    userName?: string;
    lastLoginAt?: string;
    scopes?: string[];
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
    pageTitle, children, onSignOut, agencyBalanceDetail,
    userName, lastLoginAt, scopes,
    blacklist = ["agency", 'dashboard', 'agency-dashboard', 'admin', 'department']
}) => {
    const router = usePathname();
    const searchParams = useSearchParams()
    const typeFromUrl = searchParams?.get('type');
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
                        <BreadcrumbPage className='capitalize'>{
                            typeFromUrl?.includes('reverse') ? 'Reverse' : getTitleByUrl(router)
                        }</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink className='capitalize' href={href}>{getTitleByUrl(segment)}</BreadcrumbLink>
                    )}
                </BreadcrumbItem>

            </React.Fragment>
        );
    });

    const getLinkForDashboard = () => {
        if (checkIfUserHasAccessToPage({
            backendScope: scopes,
            currentUrl: urlsListWithTitle.dashboard.url
        }))
            return urlsListWithTitle.dashboard.url
        else (checkIfUserHasAccessToPage({
            backendScope: scopes,
            currentUrl: urlsListWithTitle.viewCollectorList.url
        }))
        return urlsListWithTitle.agencyDashboard.url

    }

    return (
        <div className='flex flex-col h-screen bg-lightThemeColor p-2'>
            <Card className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Button
                    data-sidebar="trigger"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 group relative"
                    onClick={onSignOut}
                >
                    <LogOut size={16} className='cursor-pointer' />
                    <span className="absolute left-full ml-2 opacity-0 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded group-hover:opacity-100">
                        Log Out
                    </span>
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
                <div className='bg-lightThemeColor px-4 py-2 rounded-lg flex gap-2 text-sm ml-auto'>
                    <User size={16} className='self-center' /> Welcome, {userName}
                </div>
                {
                    lastLoginAt &&
                    <p className='ml-4'>Last  Login: {moment(lastLoginAt).format('DD-MM-YYYY, HH:MM:SS A')}</p>
                }
            </Card >
            <header className="p-4 bg-lightThemeColor flex">
                <h1 className="text-xl font-bold">{pageTitle}</h1>
                <div className='ml-auto self-center'>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href={getLinkForDashboard()}>Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            {breadcrumbLinks}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
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