'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { getAllCollectorIncentive, getListOfAllIncentive } from '@/app/api-calls/admin/api';
import { urlsListWithTitle } from '@/lib/utils';

const IncentivePage = () => {
    const [incentiveData, setIncentiveData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter()

    useEffect(() => {
        fetchIncentiveList();
    }, []);

    const fetchIncentiveList = async () => {
        setIsLoading(true);
        try {
            const response = await getAllCollectorIncentive();
            setIncentiveData(response.data);
        } catch (error) {
            console.error('Error fetching top-up history:', error);
            toast.error('Failed to load top-up history.');
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'Office Structure Level', key: 'officeStructureLevel', sortable: true },
        { label: 'Office Structure Name', key: 'officeStructureName', sortable: true },
        { label: 'Current %', key: 'current_amount', sortable: true },
        { label: 'Arrear %', key: 'arrear_amount', sortable: true },
    ], []);

    const [selectedRow, setSelectedRow] = useState<any | null>(null);

    const handleRowSelection = (row: any) => {
        console.log(row)
        setSelectedRow(row)
    }

    const getSelectedRowButton = () => {
        return <div className="space-x-2">
            <Button variant='destructive' onClick={() => { }}>
                <Trash2 className='cursor-pointer h-5 w-5' />Delete
            </Button>
            <Button variant='default' onClick={() => { router.push(`${urlsListWithTitle?.incentiveEdit.url}?id=${selectedRow.id}`) }}>
                <Pencil className='cursor-pointer h-5 w-5' />Edit Collector Incentive
            </Button>
        </div>
    }

    return (
        <AuthUserReusableCode pageTitle="Collector Incentive" isLoading={isLoading}>
            <div className="overflow-x-auto">
                <ReactTable
                    data={incentiveData}
                    columns={columns}
                    hideSearchAndOtherButtons
                    isSelectable={true}
                    onRowSelect={handleRowSelection}
                    onRowSelectButtons={
                        getSelectedRowButton()
                    }
                    selectedRow={selectedRow}
                />
            </div>

            <div className="mt-4 text-right">
                <Button variant="default" onClick={() => { router.push('/admin/incentive/add') }} size="lg">
                    Add Collector Incentive
                </Button>
            </div>
        </AuthUserReusableCode>
    );
};

export default IncentivePage;
