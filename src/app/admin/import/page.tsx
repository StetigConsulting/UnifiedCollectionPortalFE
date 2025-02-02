'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';

const ImportPage = () => {
    const router = useRouter();

    const handleMinimumPayableAmountClick = () => {
        router.push('/admin/import/minimum-payable-amount');
    };

    const handleConsumerToCollectorMappingClick = () => {
        router.push('/admin/import/consumer-to-collector-mapping');
    };

    return (
        <AuthUserReusableCode pageTitle="Import">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant="default"
                        size="lg"
                        className="w-full"
                        onClick={handleMinimumPayableAmountClick}
                    >
                        Minimum payable amount
                    </Button>
                    <Button
                        variant="default"
                        size="lg"
                        className="w-full"
                        onClick={handleConsumerToCollectorMappingClick}
                    >
                        Consumer to collector mapping
                    </Button>
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default ImportPage;
