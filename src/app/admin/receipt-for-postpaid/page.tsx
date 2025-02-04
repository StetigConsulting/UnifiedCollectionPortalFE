'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import ReactTable from '@/components/ReactTable';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { deleteReceiptForPostpaidById, getListOfReceiptForPostpaid } from '@/app/api-calls/admin/api';
import { testDiscom } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ReceiptsForPostpaid = () => {
    const router = useRouter();
    const [selectedConfig, setSelectedConfig] = useState('Levelwise');
    const [levelWiseData, setLevelWiseData] = useState([]);
    const [discomWiseData, setDiscomWiseData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getListOfAllReceipt()
    }, [selectedConfig])

    const getListOfAllReceipt = async () => {
        setIsLoading(true);
        try {
            const response = await getListOfReceiptForPostpaid(testDiscom);
            const transformedData = response.data.map(({ json_rule, ...rest }) => ({
                ...rest,
                ...json_rule
            }));

            if (selectedConfig === 'Levelwise') {
                setLevelWiseData(transformedData);
            } else {
                setDiscomWiseData(transformedData);
            }
            console.log(response);
        } catch (error) {
            console.error('Failed to get agency:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleConfigChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedConfig(e.target.value);
    };

    const levelWiseColumns = useMemo(() => [
        {
            label: 'Method ID',
            key: 'id',
        },
        {
            label: 'Applicable Label',
            key: 'applicableLabel',
        },
        {
            label: 'Circle',
            key: 'circle',
        },
        {
            label: 'Division',
            key: 'division',
        },
        {
            label: 'Sub Division',
            key: 'subDivision',
        },
        {
            label: 'Section',
            key: 'section',
        },
        {
            label: 'Action',
            key: 'action',
            sortable: false,
            ignored: true,
        }
    ], []);

    const discomWiseColumns = useMemo(() => [
        {
            label: 'Method ID',
            key: 'id',
        },
        {
            label: 'Bills per Month',
            key: 'receipt_per_day_per_bill',
        },
        {
            label: 'Bills per Day',
            key: 'receipt_per_month_per_bill',
        },
        {
            label: 'Action',
            key: 'action',
            sortable: false,
            ignored: true,
        }
    ], []);

    const discomWiseTableData = discomWiseData.map((item, index) => ({
        ...item,
        action: <div className='flex gap-2'>
            <Trash2 className='cursor-pointer h-5 w-5' onClick={() => handleDelete(item.id)} />
            <Pencil className='cursor-pointer h-5 w-5' onClick={() => handleEdit(item.id)} />
        </div>
    }));

    const levelWiseTableData = levelWiseData.map((item, index) => ({
        ...item,
        action: <div className='flex gap-2'>
            <Trash2 className='cursor-pointer h-5 w-5' onClick={() => handleDelete(item.id)} />
            <Pencil className='cursor-pointer h-5 w-5' onClick={() => handleEdit(item.id)} />
        </div>
    }));

    const handleDelete = async (id: number) => {
        setIsLoading(true);
        try {
            await deleteReceiptForPostpaidById(id);
            toast.success('Receipt deleted successfully');
            getListOfAllReceipt()
        } catch (error) {
            let msg = error?.error
            console.error('Failed to delete receipt:', msg);
        } finally {
            setIsLoading(false);
        }
    }

    const handleEdit = (id: number) => {
        setIsLoading(true)
        router.push(`/admin/receipt-for-postpaid/edit?id=${id}`)
    }

    const renderTable = () => {
        if (selectedConfig === 'Levelwise') {
            return (
                <>
                    <div className="mt-6">
                        <ReactTable
                            columns={levelWiseColumns}
                            data={levelWiseTableData}
                            hideSearchAndOtherButtons
                        />
                    </div>
                    <div className="mt-6 text-right space-x-4">
                        <Button variant="default" onClick={() => router.push('/admin/receipt-for-postpaid/add')}>
                            Add
                        </Button>
                    </div>
                </>
            );
        } else if (selectedConfig === 'Discomwise') {
            return (
                <>
                    <div className="mt-6">
                        <ReactTable
                            columns={discomWiseColumns}
                            data={discomWiseTableData}
                            hideSearchAndOtherButtons
                        />
                    </div>
                    <div className="mt-6 text-right space-x-4">
                        <Button variant="default" onClick={() => router.push('/admin/receipt-for-postpaid/add')}>
                            Add
                        </Button>
                    </div>
                </>
            );
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Receipts for Postpaid" isLoading={isLoading}>

            <div className="space-y-4">
                <CustomizedSelectInputWithLabel
                    label="Config rule for"
                    list={[
                        { label: 'Levelwise', value: 'Levelwise' },
                        { label: 'Discom wise', value: 'Discomwise' },
                    ]}
                    value={selectedConfig}
                    onChange={handleConfigChange}
                />
            </div>

            <div>
                {renderTable()}
            </div>


        </AuthUserReusableCode>
    );
};

export default ReceiptsForPostpaid;
