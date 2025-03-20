'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteCollectorIncentive, getAllCollectorIncentive } from '@/app/api-calls/admin/api';
import { getErrorMessage, urlsListWithTitle } from '@/lib/utils';
import AlertPopup from '@/components/Agency/ViewAgency/AlertPopup';

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
            console.error('Error fetching incentive:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteIncentive = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await deleteCollectorIncentive(id);
            toast.success('Incentive deleted successfully')
            setSelectedRow(null)
            fetchIncentiveList()
        } catch (error) {
            console.error('Error fetching top-up history:', error);
            toast.error('Error: ' + getErrorMessage(error));
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
            <AlertPopup triggerCode={<Button variant='destructive' className="cursor-pointer">
                <Trash2 className='cursor-pointer h-5 w-5' />Delete
            </Button>} handleContinue={() => deleteIncentive(selectedRow.id)}
                title='Confirm Deactivating'
                description='Are you sure you want to save the deactivate Agency? Please review the details carefully before confirming.' continueButtonText='Confirm'
            />
            <Button variant='default' onClick={() => { router.push(`${urlsListWithTitle?.incentiveEdit.url}?id=${selectedRow.id}`) }}>
                <Pencil className='cursor-pointer h-5 w-5' />Edit Collector Incentive
            </Button>
        </div>
    }

    const formattedTableData = incentiveData.map((item) => ({
        ...item,
        officeStructureLevel: item?.office_structure?.office_structure_level_name,
        officeStructureName: item?.office_structure?.office_description
    }))

    return (
        <AuthUserReusableCode pageTitle="Collector Incentive" isLoading={isLoading}>
            <div className="overflow-x-auto">
                <ReactTable
                    data={formattedTableData}
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
