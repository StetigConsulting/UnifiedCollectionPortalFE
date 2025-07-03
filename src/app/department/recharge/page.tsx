'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import { getAgenciesWithDiscom, getAgencyById, rechargeAgency, reverseRechargeAgency } from '@/app/api-calls/department/api';
import { getErrorMessage, numberToWords } from '@/lib/utils';
import { rechargeSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';


type FormData = z.infer<typeof rechargeSchema>;
const Recharge = () => {
    const { data: session } = useSession()
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(rechargeSchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (data: FormData) => {

        let payload = {
            id: data.agencyId,
            [typeFromUrl === "reverse" ? "reverse_amount" : "recharge_amount"]: data.amount,
            remarks: data.remark
        }

        try {
            setIsSubmitting(true);
            let response;
            if (typeFromUrl === "reverse") {
                response = await reverseRechargeAgency(payload)
                toast.success("Agency balance reversed successfully");

            } else {
                response = await rechargeAgency(payload)
                toast.success("Agency recharged successfully");
            }
            const url = new URL(window.location.href);
            url.search = '';
            window.history.pushState({}, '', url.href);
            reset({
                agency: null,
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
            let errorMessage = getErrorMessage(error);
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false);
        }
    };

    const [agencyList, setAgencyList] = useState([])

    const [isLoading, setIsLoading] = useState(false);

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId);
            setAgencyList(
                response?.data?.map((item) => ({
                    ...item,
                    label: item.agency_name,
                    value: item.id,
                }))
            );

        } catch (error) {
            console.error('Error: ' + getErrorMessage(error));
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
                setValue('maxRecharge', agency.maximum_limit || null);
                setValue('phoneNumber', agency.phone || '');
                setValue('currentBalance', agency.current_balance || 0);
            }
        } else {
            if (!selectedAgency && formData?.agencyName)
                reset()
        }
    }, [selectedAgency, agencyList]);

    const searchParams = useSearchParams();
    const idFromUrl = searchParams.get('id');
    const typeFromUrl = searchParams.get('type');

    useEffect(() => {
        if (idFromUrl) {
            fetchAgencyById(idFromUrl)
        } else {
            getAgencyList()
        }
    }, [idFromUrl]);

    const fetchAgencyById = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await getAgencyById(id);
            const agency = response.data;
            setValue('agency', agency.id);
            setValue('agencyId', agency.id || null);
            setValue('agencyName', agency.agency_name || '');
            setValue('phoneNumber', agency.phone || '');
            setAgencyList([{
                ...response.data,
                label: response.data.agency_name,
                value: response.data.id,
            }]);
            setValue('agency', response.data.id)
        } catch (error) {
            console.error("Failed to fetch agency by ID:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthUserReusableCode pageTitle={typeFromUrl == 'reverse' ? 'Reverse Agency Balance' : "Recharge"} isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">

                    {!idFromUrl && <CustomizedSelectInputWithLabel
                        label="Select Agency"
                        errors={errors.agency}
                        containerClass=""
                        placeholder="Select Agency"
                        list={agencyList}
                        required
                        // disabled={idFromUrl != null}
                        {...register("agency")}
                    />}
                    <CustomizedInputWithLabel
                        label="Maximum Possible Recharge"
                        placeholder="Maximum Possible Recharge"
                        {...register("maxRecharge")}
                        disabled
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
                    <CustomizedInputWithLabel
                        label="Transaction Type"
                        errors={errors.transactionType}
                        containerClass="col-span-2"
                        placeholder="Recharge"
                        {...register("transactionType")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Amount"
                        errors={errors.amount}
                        type='number'
                        required
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

                <div className="mt-4 p-4 border rounded-md flex bg-white">
                    <div className='flex-1 capitalize'>
                        <p>Recharge Amount: <span className='text-green-800'>{numberToWords(formData.amount)}</span></p>
                        <p>Current Balance: {numberToWords(formData.currentBalance)}</p>
                    </div>
                    <div className='self-center'>
                        <Button type="submit" variant="default" disabled={isSubmitting}>
                            {isSubmitting ? <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                            </> : "Submit"}
                        </Button>
                    </div>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default Recharge;
