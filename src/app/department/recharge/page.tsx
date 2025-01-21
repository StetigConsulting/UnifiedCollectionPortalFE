'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import { getAgenciesWithDiscom, rechargeAgency } from '@/app/api-calls/department/api';
import { numberToWords, testDiscom } from '@/lib/utils';
import { rechargeSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';


type FormData = z.infer<typeof rechargeSchema>;
const Recharge = () => {
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(rechargeSchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (data: FormData) => {

        let payload = {
            id: formData.agencyId,
            recharge_amount: formData.amount,
            remarks: formData.remark
        }

        try {
            setIsSubmitting(true);
            const response = await rechargeAgency(payload);
            toast.success("Agency recharged successfully");
            console.log("API Response:", response);
            reset({
                agency: "",
                agencyName: "",
                agencyId: null,
                phoneNumber: "",
                transactionType: "",
                amount: null,
                currentBalance: null,
                remark: "",
            });
            getAgencyList()
        } catch (error) {
            console.error("Failed to recharge agency:", error.data[Object.keys(error.data)[0]]);
            let errorMessage = error.data[Object.keys(error.data)[0]]
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false);
        }
    };

    const [agencyList, setAgencyList] = useState([])

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getAgencyList()
    }, [])

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(testDiscom);
            console.log("API Response:", response);
            setAgencyList(
                response?.data?.map((item) => ({
                    ...item,
                    label: item.agency_name,
                    value: item.id,
                }))
            );

        } catch (error) {
            console.error("Failed to get agency:", error.data[Object.keys(error.data)[0]]);
        } finally {
            setIsLoading(false);
        }

    }

    const formData = watch();

    const selectedAgency = watch('agency');

    useEffect(() => {
        if (selectedAgency) {
            const agency = agencyList.find((item) => item.id === Number(selectedAgency));
            if (agency) {
                setValue('agencyName', agency.agency_name || '');
                setValue('agencyId', agency.id || '');
                setValue('phoneNumber', agency.phone || '');
                setValue('currentBalance', agency.current_balance || 0);
            }
        }
    }, [selectedAgency, agencyList, setValue]);

    return (
        <AuthUserReusableCode pageTitle="Recharge" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Select Agency"
                        errors={errors.agency}
                        containerClass=""
                        placeholder="Select Agency"
                        list={agencyList}
                        {...register("agency")}
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        errors={errors.agencyName}
                        containerClass=""
                        placeholder="Agency Name"
                        {...register("agencyName")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Agency ID"
                        errors={errors.agencyId}
                        containerClass=""
                        placeholder="Agency ID"
                        {...register("agencyId")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Phone Number"
                        errors={errors.phoneNumber}
                        containerClass=""
                        placeholder="Phone Number"
                        {...register("phoneNumber")}
                        disabled
                    />
                    <CustomizedSelectInputWithLabel
                        label="Transaction Type"
                        errors={errors.transactionType}
                        containerClass="col-span-2"
                        placeholder="Recharge"
                        list={[]}
                        {...register("transactionType")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Amount"
                        errors={errors.amount}
                        containerClass=""
                        type='number'
                        placeholder="Enter Amount"
                        {...register("amount", { valueAsNumber: true })}
                    />
                    <CustomizedInputWithLabel
                        label="Current Balance"
                        errors={errors.currentBalance}
                        containerClass=""
                        placeholder="Current Balance"
                        {...register("currentBalance")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Remark"
                        errors={errors.remark}
                        containerClass="col-span-2"
                        placeholder="Any Remark"
                        {...register("remark")}
                    />
                </div>

                <div className="flex justify-end mt-4">

                </div>

                <div className="mt-4 p-4 border rounded-md flex">
                    <div className='flex-1'>
                        <p>Recharge Amount: {numberToWords(formData.amount)}</p>
                        <p>Current Balance: {numberToWords(formData.currentBalance)}</p>
                    </div>
                    <div className='self-center'>
                        <Button type="submit" variant="default" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default Recharge;
