"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ReverseAgentBalanceFormData, reverseAgentBalanceSchema } from "@/lib/zod";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { Loader2 } from "lucide-react";
import { getAllAgentByAgencyId, getRechargeableBalance, rechargeAgentById, reverseAgentBalance } from "@/app/api-calls/agency/api";
import { getErrorMessage, numberToWords } from "@/lib/utils";
import { getAgencyById, getAgencyRechargeableBalance, getAgentByPhoneNumber } from "@/app/api-calls/department/api";
import { useSession } from "next-auth/react";
import AlertPopupWithState from "@/components/Agency/ViewAgency/AlertPopupWithState";

const RechargeEntry = () => {

    const { data: session } = useSession();
    const currentUserId = session?.user?.userId

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        setError,
        clearErrors,
        reset
    } = useForm<ReverseAgentBalanceFormData>({
        resolver: zodResolver(reverseAgentBalanceSchema),
    });

    const [isLoading, setIsLoading] = useState(false);
    const [agencies, setAgencies] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [rechargeAbleBalance, setRechargeableBalance] = useState('');

    const getAgentList = async () => {
        setIsLoading(true);
        try {
            const response = await getAllAgentByAgencyId(currentUserId);
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
            const response = await getAgencyRechargeableBalance(currentUserId);
            console.log("API recharge:", response);
            setRechargeableBalance(
                response?.data?.rechargeableAgentWalletBalance
            );

        } catch (error) {
            console.error("Failed to get agent:", error?.data[Object.keys(error?.data)[0]]);
        } finally {
            setIsLoading(false);
        }
    }

    const onSubmit = async (data: ReverseAgentBalanceFormData) => {
        let payload = {
            "agent_id": data.agencyId,
            "reverse_amount": data.amount,
            "remarks": data.remark
        }
        try {
            setIsSubmitting(true);
            const response = await reverseAgentBalance(payload);
            toast.success("Agent Balance Reversed Successfully");
            console.log("API Response:", response);
            getAgencyBalance()
            // location.reload()
            reset();
        } catch (error) {
            let errorMessage = getErrorMessage(error);
            console.log(errorMessage)
            toast.error('Error: ' + errorMessage)
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
                setValue('transactionType', 'Recharge')
                setValue('currentBalance', agency.current_balance);
                setValue('maximumRecharge', agency.maximum_limit)
            }
        }
    }, [selectedAgency, agencies, setValue]);

    const [showRestFields, setShowRestFields] = useState(false);

    const handleGetAgentData = async () => {
        const mobileNumber = Number(watch('collectorMobile'));
        if (!isNaN(mobileNumber) && mobileNumber.toString().length === 10) {
            try {
                setIsLoading(true);
                const response = await getAgentByPhoneNumber(mobileNumber);
                setValue('agencyName', response.data.agent_name)
                setValue('agencyId', response.data.id)
                setValue('phoneNumber', response.data.primary_phone || '');
                setValue('transactionType', 'Reset')
                setValue('currentBalance', response.data.current_balance);
                setValue('maximumRecharge', response?.data?.maximum_limit)
                setShowRestFields(true)
            } catch (error) {
                let errorMessage = getErrorMessage(error);
                toast.error('Error: ' + errorMessage)
                setShowRestFields(false)
            } finally {
                setIsLoading(false);
            }
        } else {
            setError("collectorMobile", {
                type: "manual",
                message: "Please enter a valid 10-digit mobile number.",
            });
            return;
        }
    }

    const [stateForConfirmationPopup, setStateForConfirmationPopup] = useState(false);

    return (
        <AuthUserReusableCode pageTitle="Reverse Agent Balance" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className='space-y-2'>
                    <div className="col-span-2">
                        <CustomizedInputWithLabel
                            label="Agent Mobile"
                            type="text"
                            {...register('collectorMobile', { valueAsNumber: true })}
                            onChange={() => {
                                clearErrors("collectorMobile")
                                setValue('agencyId', null)
                                setValue('agencyName', '')
                                setValue('phoneNumber', null)
                                setValue('transactionType', null)
                                setValue('currentBalance', null)
                                setShowRestFields(false)
                            }}
                            errors={errors.collectorMobile}
                        />
                    </div>
                    <div className='text-end'>
                        <Button type="button" onClick={handleGetAgentData} disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Search'}
                        </Button>
                    </div>
                </div>
                {
                    // showRestFields &&
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <CustomizedInputWithLabel
                                label="Agency Name"
                                containerClass="col-span-2"
                                errors={errors.agencyName}
                                disabled
                                {...register("agencyName")}
                            />
                            <CustomizedInputWithLabel
                                label="Agency ID"
                                errors={errors.agencyId}
                                disabled
                                {...register("agencyId", { valueAsNumber: true })}
                            />
                            <CustomizedInputWithLabel
                                label="Phone Number"
                                errors={errors.phoneNumber}
                                disabled
                                {...register("phoneNumber")}
                            />

                            <CustomizedInputWithLabel
                                label="Transaction Type"
                                containerClass="col-span-2"
                                errors={errors.transactionType}
                                disabled
                                {...register("transactionType")}
                            />
                            <CustomizedInputWithLabel
                                label="Current Balance"
                                errors={errors.currentBalance}
                                placeholder="Current Balance"
                                type="number"
                                disabled
                                {...register("currentBalance")}
                            />
                            <CustomizedInputWithLabel
                                label="Reversal Amount"
                                required={true}
                                errors={errors.amount}
                                placeholder="Enter Amount"
                                disabled={!showRestFields}
                                type="number"
                                {...register("amount", { valueAsNumber: true })}
                            />
                            <CustomizedInputWithLabel
                                label="Remark"
                                containerClass="col-span-2"
                                errors={errors.remark}
                                disabled={!showRestFields}
                                placeholder="Any Remark"
                                {...register("remark")}
                            />
                        </div>

                        <div className="text-end">
                            <AlertPopupWithState
                                triggerCode={
                                    <Button
                                        variant="default"
                                        disabled={isSubmitting || !showRestFields}
                                        onClick={handleSubmit((e) => { setStateForConfirmationPopup(true); })}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                            </>
                                        ) : (
                                            "Submit"
                                        )}
                                    </Button>
                                }
                                handleContinue={handleSubmit(onSubmit)}
                                title="Confirm Reversal"
                                description="Are you sure you want to reverse the balance of this Agent?"
                                continueButtonText="Yes"
                                isOpen={stateForConfirmationPopup}
                                setIsOpen={setStateForConfirmationPopup}
                            />
                            {/* <Button type="submit" variant="default" disabled={isSubmitting || !showRestFields}>
                                {isSubmitting ? <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                </> : "Submit"}
                            </Button> */}
                        </div>
                    </>
                }
            </form>
        </AuthUserReusableCode>
    );
};

export default RechargeEntry;
