'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import ReactTable from '@/components/ReactTable'; // Referencing your reusable table component
import { toast } from 'sonner';
import TabForRouting from '@/components/ColorCoding/TabForRouting';
import { getColorCodingBillBasis } from '@/app/api-calls/admin/api';
import { testDiscom } from '@/lib/utils';

const BillBasis = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [colorLogicEntries, setColorLogicEntries] = useState([]);

    const columns = [
        { label: 'Font ID', key: 'id', sortable: true },
        { label: 'Font', key: 'bill_type', sortable: true },
        { label: 'BG Color', key: 'color_code', sortable: true },
        {
            label: 'Action',
            key: 'action',
            sortable: false,
        },
    ];

    const handleEdit = (index: number) => {
        toast.success('Edit functionality is not implemented yet.');
    };

    const handleDelete = (index: number) => {
        const updatedEntries = colorLogicEntries.filter((_, i) => i !== index);
        setColorLogicEntries(updatedEntries);
        toast.success('Row deleted successfully!');
    };

    useEffect(() => {
        getListOfData()
    }, [])

    const getListOfData = async () => {
        setIsLoading(true);
        try {
            const response = await getColorCodingBillBasis(testDiscom);
            setColorLogicEntries(response?.data);
            console.log(response);
        } catch (error) {
            console.error('Failed to get agency:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthUserReusableCode pageTitle="Bill basis" isLoading={isLoading}>
            {/* <TabForRouting router={router} /> */}
            <ReactTable
                data={colorLogicEntries}
                columns={columns}
                hideSearchAndOtherButtons
            />

            <div className="mt-6 text-end space-x-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button variant="default" onClick={() => router.push('/admin/color-coding/bill-basis/add')}>
                    Add
                </Button>
            </div>
        </AuthUserReusableCode>
    );
};

export default BillBasis;
