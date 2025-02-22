'use client'

import ReactTable from '@/components/ReactTable';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { urlsListWithTitle } from '@/lib/utils';

const PaymentConfiguration = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);

    const columns = [
        { label: 'Method ID', key: 'id', sortable: true },
        { label: 'Method Name', key: 'method_name', sortable: true },
        { label: 'Activated Date', key: 'activated_date', sortable: true },
        { label: 'Deactivated Date', key: 'deactivated_date', sortable: true },
    ];

    const fetchPaymentMethods = async () => {
        setIsLoading(true);
        try {
            // const response = await getPaymentMethods();
            setPaymentMethods([]);
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
            toast.error('Error fetching payment methods');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    return (
        <AuthUserReusableCode pageTitle="Mode Of Payment" isLoading={isLoading}>
            <div className='p-4'>
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="default" size="lg" className="w-full"
                        onClick={() => { router.push(urlsListWithTitle.modeOfPaymentAdd.url) }}
                    >
                        Setup Payment Mode
                    </Button>
                </div>
            </div>
            <ReactTable
                data={paymentMethods}
                columns={columns}
                hideSearchAndOtherButtons
                avoidSrNo
            />
        </AuthUserReusableCode>
    );
};

export default PaymentConfiguration;
