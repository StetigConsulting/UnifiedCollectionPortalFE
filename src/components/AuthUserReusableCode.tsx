import React, { useEffect, useMemo, useState } from 'react'
import { SidebarInset, SidebarProvider } from './ui/sidebar'
import { AppSidebar } from './AppSidebar'
import CustomBreadcrumb from './CustomBreadcrumb'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { getRosourceByDiscomId } from '@/app/api-calls/other/api'
import { getAgencyRechargeableBalance } from '@/app/api-calls/department/api'
import { handleSignOut } from '@/app/actions/authActions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AuthUserReusableCodeProps {
    children: React.ReactNode;
    pageTitle: string;
    isLoading?: boolean;
}

function AuthUserReusableCode({ children, pageTitle, isLoading = false }: AuthUserReusableCodeProps) {
    const { data: session } = useSession()

    const router = useRouter()

    const [logoLink, setLogoLink] = React.useState('')

    const [agencyBalanceDetail, setAgencyBalanceDetail] = React.useState({})

    const [isFetchingResource, setIsFetchingResource] = useState(false)

    const memoizedLogoLink = useMemo(() => logoLink, [logoLink]);

    React.useEffect(() => {
        if (session?.user) {
            getHeaderDetails()
        }
    }, [])

    const getHeaderDetails = async () => {
        setIsFetchingResource(true)
        await getRosourceByDiscomId(session?.user?.discomId).then((res) => {
            const logoValue = res.data.find(item => item.name === "Logo")?.value;
            setLogoLink(logoValue);
        })

        if (session?.user?.userScopes.includes('TPCollectionWebPortal:agency_balance:READ')) {
            await getAgencyRechargeableBalance(session?.user?.userId).then((res) => {
                setAgencyBalanceDetail(res.data)
            })
        }
        setIsFetchingResource(false)
    }

    useEffect(() => {
        if (session == null) {
            console.log('session expired', session)
            toast.error('Session Expired')
            // handleSignOut();
            // router.push('/auth/signin');
        }
    }, [session])

    const onSignOut = async (event: React.MouseEvent) => {
        event.preventDefault();
        await handleSignOut();
    };

    return (
        <SidebarProvider style={{
            display: '-webkit-box',
            boxSizing: 'border-box'
        }}>
            <AppSidebar logoLink={memoizedLogoLink} onSignOut={onSignOut} />
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
                <CustomBreadcrumb pageTitle={pageTitle} onSignOut={onSignOut}
                    userName={session?.user?.userName} lastLoginAt={session?.user?.lastLoginAt}
                    agencyBalanceDetail={agencyBalanceDetail} scopes={session?.user?.userScopes}>
                    {children}
                </CustomBreadcrumb>
            </SidebarInset>
        </SidebarProvider >
    )
}

export default React.memo(AuthUserReusableCode)