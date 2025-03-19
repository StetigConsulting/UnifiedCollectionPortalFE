'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Network, Waypoints } from 'lucide-react';
import { urlsListWithTitle } from '@/lib/utils';

const ImportPage = () => {
    const router = useRouter();

    return (
        <AuthUserReusableCode pageTitle="Excel Import">
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col gap-4 items-center">
                    <Button variant="default" className="w-full py-8 text-lg" onClick={() => router.push(urlsListWithTitle.consumerToMinimumPayableAmountMap.url)}>
                        <Network className="h-5 w-5" /> Consumer to Minimum Payable Amount Mapping
                    </Button>
                    <Button variant="default" className="w-full py-8 text-lg" onClick={() => router.push(urlsListWithTitle.eclConsummerWithArrearImport.url)}>
                        <Network className="h-5 w-5" /> Excel Import for ECL Consumer with Arrear
                    </Button>
                    <Button variant="default" className="w-full py-8 text-lg" onClick={() => router.push(urlsListWithTitle.consumerToCollectorMap.url)}>
                        <Waypoints className="h-5 w-5" /> Consumer to Collector Mapping
                    </Button>
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default ImportPage;
