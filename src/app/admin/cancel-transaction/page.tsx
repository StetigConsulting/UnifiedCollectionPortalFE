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
import { cancelTransactionTypePicklist, formatDate, getErrorMessage } from '@/lib/utils';
import { cancelTransactionWithId, getAllListOfReceipts } from '@/app/api-calls/admin/api';
import { toast } from 'sonner';
import SuccessErrorModal from '@/components/SuccessErrorModal';
import AlertPopup from '@/components/Agency/ViewAgency/AlertPopup';

const CancelTransactionPage = () => {
    const { data: session } = useSession();
    const [dataList, setDataList] = useState([]);

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

    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: any) => {
        let payload = {
            record_type: data?.type,
            record_id: data?.recordId,
            ...data?.type === cancelTransactionTypePicklist?.[2]?.value
            && { serivce_connection_date: data?.transactionDate },
        }

        try {
            setIsLoading(true);
            const response = await getAllListOfReceipts(payload);
            setDataList(response?.data || []);
        } catch (error) {
            console.error(getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        {
            label: 'Action',
            key: 'action',
        },
        { label: 'System ID', key: 'collection_id' },
        { label: 'Agency Name', key: 'agency_name' },
        { label: 'Agent ID', key: 'agent_id' },
        { label: 'Agent Mobile No.', key: 'agent_mobile_number' },
        { label: 'Agent Name', key: 'agent_name' },
        { label: 'Transaction Date', key: 'created_on' },
        { label: 'Payment ID', key: 'money_receipt_no' },
        { label: 'Transaction ID', key: 'transaction_id' },
        { label: 'Consumer No.', key: 'consumer_service_connection_no' },
        { label: 'Amount', key: 'payment_amount' },
    ], []);

    const formatData = dataList.map((item: any) => ({
        ...item,
        created_on: formatDate(item?.created_on),
        action: (
            <AlertPopup triggerCode={<Button variant="destructive" size="sm" className="w-24">
                Cancel
            </Button>} handleContinue={() => handleCancelTransaction(item?.collection_id)}
                title='Confirm Cancellation?'
                description='Are you sure you want to cancel this transaction?'
                continueButtonText='Confirm'
            />
        ),
    }))

    const handleCancelTransaction = async (id: string) => {
        try {
            setIsLoading(true);
            let payload = {
                collection_id: id,
            }
            await cancelTransactionWithId(payload);
            toast.success('Transaction cancelled successfully!');
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
            setIsErrorModalOpened(true);
        } finally {
            setIsLoading(false);
        }
    }

    const [isErrorModalOpened, setIsErrorModalOpened] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    return (
        <AuthUserReusableCode pageTitle="Cancel Transaction" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-4 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Type"
                        placeholder="Select Type"
                        list={cancelTransactionTypePicklist}
                        {...register('type')}
                        errors={errors?.type as any}
                    />

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
                    data={formatData}
                    columns={columns}
                    hideSearchAndOtherButtons
                    avoidSrNo={false}
                />
            </div>

            <SuccessErrorModal isOpen={isErrorModalOpened} onClose={() => setIsErrorModalOpened(false)}
                message={errorMessage} type="error"
            />
        </AuthUserReusableCode>
    );
};

export default CancelTransactionPage;
