'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { urlsListWithTitle } from '@/lib/utils';

const DeniedToPayConfiguration = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [deniedToPayData, setDeniedToPayData] = useState([]);

    const columns = [
        { label: 'Sr. No.', key: 'id', sortable: true },
        { label: 'Denied To Pay Reason', key: 'deniedReason', sortable: true },
        { label: 'Updated Date for Denied to Pay Reasons', key: 'deniedDate', sortable: true },
        { label: 'Paid Reasons', key: 'paidReason', sortable: true },
        { label: 'Updated Date for Paid Reasons', key: 'paidDate', sortable: true },
    ];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // const data = await fetchDeniedToPayData();
            // setDeniedToPayData(data);
        } catch (error) {
            console.error('Error fetching denied to pay data:', error);
            toast.error('Error fetching denied to pay data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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

                <ReactTable
                    data={deniedToPayData}
                    columns={columns}
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
