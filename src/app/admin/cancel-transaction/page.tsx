"use client";

import React, { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Button } from '@/components/ui/button';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { CancelTransactionFormData, CancelTransactionSchema } from '@/lib/zod';
import { cancelTransactionTypePicklist } from '@/lib/utils';

const dummyData = [

];

const CancelTransactionPage = () => {
    const { data: session } = useSession();
    const [dataList, setDataList] = useState(dummyData);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CancelTransactionFormData>({
        resolver: zodResolver(CancelTransactionSchema),
        defaultValues: {},
    });

    const selectedType = useWatch({ control, name: 'type' });

    const onSubmit = async (data: CancelTransactionFormData) => {
        console.log("Searching with:", data);
        setDataList(dummyData);
    };

    const columns = useMemo(() => [
        {
            label: 'Action',
            key: 'action',
        },
        { label: 'System ID', key: 'system_id' },
        { label: 'Agency Name', key: 'agency_name' },
        { label: 'Agent ID', key: 'agent_id' },
        { label: 'Agent Mobile No.', key: 'agent_mobile' },
        { label: 'Agent Name', key: 'agent_name' },
        { label: 'Transaction Date', key: 'transaction_date' },
        { label: 'Payment ID', key: 'payment_id' },
        { label: 'Transaction ID', key: 'transaction_id' },
        { label: 'Consumer No.', key: 'consumer_no' },
        { label: 'Amount', key: 'amount' },
    ], []);

    return (
        <AuthUserReusableCode pageTitle="Cancel Transaction">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-5 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Type"
                        placeholder="Select Type"
                        list={cancelTransactionTypePicklist}
                        {...register('type')}
                        errors={errors?.type as any}
                    />

                    {selectedType === cancelTransactionTypePicklist?.[2]?.value && (
                        <CustomizedInputWithLabel
                            label="Consumer Service Connection No."
                            placeholder="Enter Consumer Service Connection No."
                            {...register('consumerServiceConnectionNo')}
                            errors={(errors as any)?.consumerServiceConnectionNo}
                        />
                    )}

                    <CustomizedInputWithLabel
                        label="Record ID"
                        placeholder="Enter Record ID"
                        {...register('recordId')}
                        errors={errors?.recordId}
                    />

                    {selectedType === cancelTransactionTypePicklist?.[2]?.value && (
                        <CustomizedInputWithLabel
                            label="Transaction Date"
                            type="date"
                            {...register('transactionDate')}
                            errors={(errors as any)?.transactionDate}
                        />
                    )}

                    <div className="flex self-start mt-6">
                        <Button type="submit">Search</Button>
                    </div>
                </div>
            </form>

            <div className="overflow-x-auto mt-4">
                <ReactTable
                    data={dataList}
                    columns={columns}
                    hideSearchAndOtherButtons
                    avoidSrNo={false}
                />
            </div>
        </AuthUserReusableCode>
    );
};

export default CancelTransactionPage;
