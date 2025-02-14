'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import ReactTable from '@/components/ReactTable';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { deleteBusinessRule, getListOfReceiptForPostpaid } from '@/app/api-calls/admin/api';
import { listOfUrls } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { getLevels } from '@/app/api-calls/department/api';

const ReceiptsForPostpaid = () => {
    const { data: session } = useSession()
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
            const response = await getListOfReceiptForPostpaid(session?.user?.discomId);
            const discomList = await getLevels(session?.user?.discomId);
            const listOfLevel = discomList.data.reduce((acc, item) => {
                acc[item.id] = item.levelName;
                return acc;
            }, {});
            const transformedData = response.data
                .filter(({ rule_level }) => rule_level === selectedConfig)
                .map(({ json_rule, office_structure, ...rest }) => ({
                    ...rest,
                    ...json_rule,
                    ...(selectedConfig === 'Levelwise' && office_structure && {
                        applicableLevel: listOfLevel[office_structure.office_structure_level_id] || "Unknown Level",
                        officeLevel: office_structure.office_description
                    }),
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
            label: 'Applicable Level',
            key: 'applicableLevel',
        },
        {
            label: 'Applicable Office Name',
            key: 'officeLevel',
        },
        {
            label: 'Number of Receipts Possbile Per Month Per Consumer',
            key: 'receipt_per_month_per_bill',
        },
        {
            label: 'Number of Recipts Possible Per Day Per Consumer',
            key: 'receipt_per_day_per_bill',
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
            label: 'Number of Receipts Possbile Per Month Per Consumer',
            key: 'receipt_per_month_per_bill',
        },
        {
            label: 'Number of Recipts Possible Per Day Per Consumer',
            key: 'receipt_per_day_per_bill',
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
            await deleteBusinessRule(id);
            toast.success('Number of Receipts rule deleted successfully');
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
        router.push(`${listOfUrls.receiptForPostpaidEdit}?id=${id}`)
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
                            avoidSrNo
                        />
                    </div>
                    <div className="mt-6 text-right space-x-4">
                        <Button variant="default" onClick={() => router.push(listOfUrls?.receiptForPostpaidAdd)}>
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
                            noPagination
                            avoidSrNo
                        />
                    </div>
                    {
                        discomWiseTableData.length == 0 &&
                        <div className="mt-6 text-right space-x-4">
                            <Button variant="default" onClick={() => router.push(listOfUrls?.receiptForPostpaidAdd)}>
                                Add
                            </Button>
                        </div>
                    }
                </>
            );
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Receipt for Postpaid" isLoading={isLoading}>

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
