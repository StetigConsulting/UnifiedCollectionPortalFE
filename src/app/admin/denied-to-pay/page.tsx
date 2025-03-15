'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { urlsListWithTitle } from '@/lib/utils';
import { getDeniedToPayData, getPaidReason } from '@/app/api-calls/admin/api';

const DeniedToPayConfiguration = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [deniedToPayData, setDeniedToPayData] = useState([]);
    const [paidReason, setPaidReason] = useState([]);

    const deniedToPayColumns = [
        { label: 'Sr. No.', key: 'id', sortable: true },
        { label: 'Denied To Pay Reason', key: 'deniedReason', sortable: true },
        { label: 'Updated Date for Denied to Pay Reasons', key: 'deniedDate', sortable: true },
    ];

    const paidReasonColumns = [
        { label: 'Sr. No.', key: 'id', sortable: true },
        { label: 'Denied To Pay Reason', key: 'deniedReason', sortable: true },
        { label: 'Updated Date for Denied to Pay Reasons', key: 'deniedDate', sortable: true },
    ];

    const fetchDeniedToPay = async () => {
        setIsLoading(true);
        try {
            const data = await getDeniedToPayData();
            setDeniedToPayData(data.data);
        } catch (error) {
            console.error('Error fetching denied to pay data:', error);
            toast.error('Error fetching denied to pay data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPaidReason = async () => {
        setIsLoading(true);
        try {
            const data = await getPaidReason();
            setDeniedToPayData(data.data);
        } catch (error) {
            console.error('Error fetching denied to pay data:', error);
            toast.error('Error fetching denied to pay data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeniedToPay();
        fetchPaidReason();
    }, []);

    return (
        <AuthUserReusableCode pageTitle="Denied To Pay" isLoading={isLoading}>
            <div className='p-4'>
                <div className="flex justify-start mb-4">
                    <Button variant="default" size="lg"
                        onClick={() => router.push(urlsListWithTitle.deniedToPaySetup.url)}
                    >
                        Setup Denied To Pay / Paid Reasons
                    </Button>
                </div>

                <p className='font-bold mb-4'>Denied To Pay</p>
                <ReactTable
                    data={deniedToPayData}
                    columns={deniedToPayColumns}
                    hideSearchAndOtherButtons
                    avoidSrNo
                />

                <p className='font-bold my-4'>Paid Reasons</p>
                <ReactTable
                    data={paidReason}
                    columns={paidReasonColumns}
                    hideSearchAndOtherButtons
                    avoidSrNo
                />

                <div className="mt-4 p-2 bg-gray-100 text-center text-sm rounded-md">
                    Denied To Pay Maximum Count Per Day for Each Collector: <strong>3</strong>
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default DeniedToPayConfiguration;
