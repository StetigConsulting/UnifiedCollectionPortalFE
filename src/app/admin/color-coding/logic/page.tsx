'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import ReactTable from '@/components/ReactTable';
import { toast } from 'sonner';
import { deleteBusinessRule, getBusinessRuleDateById, getColorCodingBillBasis, getColorCodingLogic } from '@/app/api-calls/admin/api';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { getErrorMessage } from '@/lib/utils';

const ColorCodingLogic = () => {
    const { data: session } = useSession()
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [colorLogicEntries, setColorLogicEntries] = useState([]);

    const columns = [
        { label: 'Color Coding ID', key: 'id', sortable: true },
        { label: 'Order', key: 'order', sortable: true },
        { label: 'Value 1', key: 'R1_value', sortable: true },
        { label: 'Value 2', key: 'R2_value', sortable: true },
        { label: 'Bill Background Color', key: 'color_code', sortable: true },
        {
            label: 'Action',
            key: 'action',
            sortable: false,
        },
    ];

    const tableData = colorLogicEntries.map((item, index) => ({
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
            toast.success('Receipt deleted successfully');
            getListOfData()
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    const handleEdit = (id: number) => {
        setIsLoading(true)
        router.push(`/admin/color-coding/logic/add?id=${id}`)
    }

    useEffect(() => {
        getListOfData()
    }, [])

    const getListOfData = async () => {
        setIsLoading(true);
        try {
            const response = await getColorCodingLogic(session?.user?.discomId);
            // setColorLogicEntries(response?.data);
            const transformRules = (rules) => {
                return rules.flatMap(rule =>
                    rule.json_rule.ranges.map((range, index) => ({
                        id: rule.id,
                        rule_name: rule.rule_name,
                        rule_label: rule.rule_label,
                        rule_level: rule.rule_level,
                        discom_id: rule.discom.id,
                        discom_name: rule.discom.office_description,
                        office_id: rule.office_structure.id,
                        office_name: rule.office_structure.office_description,
                        order: range.order,
                        R1_type: range.R1.type,
                        R1_value: range.R1.type === 'DATE' ? moment(range.R1.value, "DD-MM-YYYY", true).format('DD/MM/YYYY') : range.R1.value,
                        R2_type: range.R2.type,
                        R2_value: range.R2.type === 'DATE' ? moment(range.R2.value, "DD-MM-YYYY", true).format('DD/MM/YYYY') : range.R2.value,
                        color_code: <div style={{ backgroundColor: range.color_code, width: '100%', height: '20px' }}></div>,
                        created_on: rule.created_on,
                        modified_on: rule.modified_on,
                        is_active: rule.is_active,
                        is_manual_rule: rule.is_manual_rule
                    }))
                );
            };

            const transformedData = transformRules(response?.data);
            setColorLogicEntries(transformedData);
        } catch (error) {
            console.error('Failed to get data:', error);
        } finally {
            setIsLoading(false);
        }
    }



    return (
        <AuthUserReusableCode pageTitle="Color Coding Logic" isLoading={isLoading}>
            {/* <TabForRouting router={router} /> */}
            <ReactTable
                data={tableData}
                columns={columns}
                hideSearchAndOtherButtons
                avoidSrNo
            />

            <div className="mt-6 text-end space-x-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                </Button>
                {
                    tableData.length > 0 ? <Button variant="default" onClick={() => router.push(`/admin/color-coding/logic/add?id=${tableData[0].id}`)}>
                        Edit
                    </Button> : <Button variant="default" onClick={() => router.push('/admin/color-coding/logic/add')}>
                        Add
                    </Button>
                }
            </div>
        </AuthUserReusableCode>
    );
};

export default ColorCodingLogic;
