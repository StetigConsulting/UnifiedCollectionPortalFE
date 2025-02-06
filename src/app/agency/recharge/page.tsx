"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { rechargeSchemaCollector, RechargeCollectorFormData } from "@/lib/zod";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { Loader2 } from "lucide-react";
import { getAllAgentByAgencyId, getRechargeableBalance, rechargeAgentById } from "@/app/api-calls/agency/api";
import { numberToWords, testAgencyId } from "@/lib/utils";

const RechargeEntry = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm<RechargeCollectorFormData>({
        resolver: zodResolver(rechargeSchemaCollector),
    });

    const [isLoading, setIsLoading] = useState(false);
    const [agencies, setAgencies] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [rechargeAbleBalance, setRechargeableBalance] = useState('');

    const getAgentList = async () => {
        setIsLoading(true);
        try {
            const response = await getAllAgentByAgencyId(testAgencyId);
            console.log("API Response:", response);
            setAgencies(
                response?.data?.map((item) => ({
                    ...item,
                    label: item.agent_name,
                    value: item.id,
                }))
            );

        } catch (error) {
            console.error("Failed to get agent:", error?.data[Object.keys(error?.data)[0]]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getAgentList()
        getAgencyBalance()
    }, []);

    const getAgencyBalance = async () => {
        setIsLoading(true);
        try {
            const response = await getRechargeableBalance(testAgencyId);
            console.log("API Response:", response);
            setRechargeableBalance(
                response?.data?.map((item) => ({
                    ...item,
                    label: item.agent_name,
                    value: item.id,
                }))
            );

        } catch (error) {
            console.error("Failed to get agent:", error?.data[Object.keys(error?.data)[0]]);
        } finally {
            setIsLoading(false);
        }
    }

    const onSubmit = async (data: RechargeCollectorFormData) => {
        let payload = {
            "agent_id": data.agencyId,
            "recharge_amount": data.amount,
            "remarks": data.remark
        }
        try {
            setIsSubmitting(true);
            const response = await rechargeAgentById(payload, testAgencyId);
            toast.success("Agenct recharge successfully");
            console.log("API Response:", response);
            reset();
        } catch (error) {
            // console.error("Failed to edit agency:", error.data[Object.keys(error.data)[0]]);
            let errorMessage = error?.data && error?.data[Object.keys(error?.data)[0]] || error?.error
            console.log(errorMessage)
            toast.error('Error: ' + errorMessage || error?.error)
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedAgency = watch('collectorMobile');
    const formData = watch();

    useEffect(() => {
        if (selectedAgency) {
            const agency = agencies.find((item) => item.id === Number(selectedAgency));
            if (agency) {
                setValue('agencyId', agency.id || null);
                setValue('agencyName', agency.agent_name || '');
                setValue('phoneNumber', agency.primary_phone || '');
                setValue('transactionType', 'Reacharge')
                setValue('currentBalance', agency.current_balance);
            }
        }
    }, [selectedAgency, agencies, setValue]);

    return (
        <AuthUserReusableCode pageTitle="Recharge Entry" isLoading={isLoading}>
            <div className="mb-4 p-2 bg-lightThemeColor rounded-md">
                <span className="text-lg">
                    Available Balance For Recharge : ₹ 1400
                </span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Collector Mobile"
                        list={agencies}
                        required={true}
                        errors={errors.collectorMobile}
                        containerClass="col-span-2"
                        {...register("collectorMobile")}
                    />
                    <CustomizedInputWithLabel
                        label="Agency ID"
                        required={true}
                        errors={errors.agencyId}
                        disabled
                        {...register("agencyId")}
                    />
                    <CustomizedInputWithLabel
                        label="Phone Number"
                        required={true}
                        errors={errors.phoneNumber}
                        disabled
                        {...register("phoneNumber")}
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        required={true}
                        errors={errors.agencyName}
                        disabled
                        {...register("agencyName")}
                    />
                    <CustomizedInputWithLabel
                        label="Transaction Type"
                        required={true}
                        errors={errors.transactionType}
                        disabled
                        {...register("transactionType")}
                    />
                    <CustomizedInputWithLabel
                        label="Amount"
                        required={true}
                        errors={errors.amount}
                        placeholder="Enter Amount"
                        type="number"
                        {...register("amount", { valueAsNumber: true })}
                    />

                    <CustomizedInputWithLabel
                        label="Current Balance"
                        required={true}
                        errors={errors.currentBalance}
                        placeholder="Current Balance"
                        type="number"
                        disabled
                        {...register("currentBalance")}
                    />
                    <CustomizedInputWithLabel
                        label="Remark"
                        containerClass="col-span-2"
                        errors={errors.remark}
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

export default RechargeEntry;
