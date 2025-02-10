'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import ReactTable from '@/components/ReactTable';
import { toast } from 'sonner';
import TabForRouting from '@/components/ColorCoding/TabForRouting';
import { deleteBusinessRule, getColorCodingBillBasis } from '@/app/api-calls/admin/api';
import { testDiscom } from '@/lib/utils';

const BillBasis = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [colorLogicEntries, setColorLogicEntries] = useState([]);

    const columns = [
        // { label: 'Font ID', key: 'id', sortable: true },
        { label: 'Font', key: 'bill_type', sortable: true },
        { label: 'BG Color', key: 'bg_color_code', sortable: true },
        {
            label: 'Action',
            key: 'action',
            sortable: false,
        },
    ];

    const tableData = colorLogicEntries.map((item, index) => ({
        ...item,
        bg_color_code: <div style={{ backgroundColor: item.color_code, width: '100%', height: '20px' }}></div>,
        action: <div className='flex gap-2'>
            <Trash2 className='cursor-pointer h-5 w-5' onClick={() => handleDelete(item.id)} />
            <Pencil className='cursor-pointer h-5 w-5' onClick={() => handleEdit(item.id)} />
        </div>
    }));

    const handleDelete = async (id: number) => {
        setIsLoading(true);
        try {
            await deleteBusinessRule(id);
            toast.success('Receipt deleted successfully');
            getListOfData()
        } catch (error) {
            let msg = error?.error
            console.error('Failed to delete receipt:', msg);
        } finally {
            setIsLoading(false);
        }
    }

    const handleEdit = (id: number) => {
        setIsLoading(true)
        router.push(`/admin/color-coding/bill-basis/add?id=${id}`)
    }

    useEffect(() => {
        getListOfData()
    }, [])

    const getListOfData = async () => {
        setIsLoading(true);
        try {
            const response = await getColorCodingBillBasis(testDiscom);

            let data = response?.data.flatMap(item =>
                item.json_rule.bill_basis.map(bill => ({
                    ...item,
                    ...bill,
                    json_rule: undefined
                }))
            );
            setColorLogicEntries(data);
        } catch (error) {
            console.error('Failed to get agency:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthUserReusableCode pageTitle="Bill Basis" isLoading={isLoading}>
            {/* <TabForRouting router={router} /> */}
            <ReactTable
                data={tableData}
                columns={columns}
                hideSearchAndOtherButtons
            />

            {
                tableData.length == 0 && <div className="mt-6 text-end space-x-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button variant="default" onClick={() => router.push('/admin/color-coding/bill-basis/add')}>
                        Add
                    </Button>
                </div>
            }

        </AuthUserReusableCode>
    );
};

export default BillBasis;
