"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { agentBankDepositSchema, AgentBankDepositFormData } from "@/lib/zod";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { Loader2 } from "lucide-react";
import { addAgentBankDeposit, uploadAgentBankDepositSlip } from "@/app/api-calls/agency/api";
import { getErrorMessage, numberToWords } from "@/lib/utils";
import { getAgencyById, getAgentByPhoneNumber } from "@/app/api-calls/department/api";
import { getAllBankList } from "@/app/api-calls/other/api";
import { useSession } from "next-auth/react";

const AgentBankDeposit = () => {
    const { data: session } = useSession()
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        setError,
        clearErrors,
        reset
    } = useForm<AgentBankDepositFormData>({
        resolver: zodResolver(agentBankDepositSchema),
        defaultValues: {
            depositAmount: null,
            depositDate: '',
            txnRefNo: '',
            bank: ''
        },
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [bankList, setBankList] = useState([]);

    useEffect(() => {
        getBankList()
    }, []);

    const getBankList = async () => {
        setIsLoading(true);
        try {
            const response = await getAllBankList();
            let listOfBanks = response.data.map(current => {
                return {
                    id: current.id,
                    value: current.bankName,
                    label: current.bankName,
                }
            })
            setBankList(listOfBanks)
        } catch (error) {
            console.error("Failed to get agent:", error?.data[Object.keys(error?.data)[0]]);
        } finally {
            setIsLoading(false);
        }
    }

    const onSubmit = async (data: AgentBankDepositFormData) => {

        const formData = new FormData();
        formData.append('file', data.depositSlip[0]);

        console.log(data.depositSlip);

        try {
            setIsSubmitting(true);
            const fileUploadResponse = await uploadAgentBankDepositSlip(formData);
            console.log("API Response:", fileUploadResponse);

            let payload = {
                "discom_id": session?.user?.discomId,
                "agent_id": data.agentId,
                "bank_name": data?.bank,
                "deposit_date": data.depositDate,
                "amount": data.depositAmount,
                "txn_ref_no": data?.txnRefNo,
                "deposit_slip_file_name": fileUploadResponse?.data?.filePath
            }

            const response = await addAgentBankDeposit(payload);

            toast.success('Agent Bank Deposit added successfully')
            reset()
        } catch (error) {
            let errorMessage = getErrorMessage(error);
            console.log(errorMessage)
            toast.error('Error: ' + errorMessage)
        } finally {
            setIsSubmitting(false);
        }
    };

    const formData = watch();

    const [showRestFields, setShowRestFields] = useState(false);

    const handleGetAgentData = async () => {
        const mobileNumber = Number(watch('collectorMobile'));
        if (!isNaN(mobileNumber) && mobileNumber.toString().length === 10) {
            try {
                setIsLoading(true);
                const response = await getAgentByPhoneNumber(mobileNumber);
                setValue('agentName', response.data.agent_name)
                setValue('agentId', response.data.id)
                setValue('phoneNumber', response.data.primary_phone || '');
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

    return (
        <AuthUserReusableCode pageTitle="Agent Bank Deposit" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className='space-y-2'>
                    <div className="col-span-2">
                        <CustomizedInputWithLabel
                            label="Agent Mobile"
                            type="number"
                            {...register('collectorMobile', { valueAsNumber: true })}
                            onChange={() => {
                                clearErrors("collectorMobile")
                                setValue('agentName', '')
                                setValue('phoneNumber', '')
                                setValue('agentId', null)
                                setValue('depositAmount', null)
                                setValue('depositDate', '')
                                setValue('txnRefNo', '')
                                setValue('bank', '')
                                setValue('depositSlip', null)
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
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Agent Name"
                        errors={errors.agentName}
                        disabled
                        {...register("agentName")}
                    />
                    <CustomizedInputWithLabel
                        label="Phone Number"
                        errors={errors.phoneNumber}
                        disabled
                        {...register("phoneNumber")}
                    />
                    <CustomizedInputWithLabel
                        label="Agency ID"
                        errors={errors.agentId}
                        disabled
                        {...register("agentId")}
                    />
                    <CustomizedInputWithLabel
                        label="Deposit Amount"
                        type="number"
                        required={true}
                        disabled={!showRestFields}
                        errors={errors.depositAmount}
                        {...register("depositAmount", { valueAsNumber: true })}
                    />
                    <CustomizedInputWithLabel
                        label="Deposit Date"
                        required={true}
                        errors={errors.depositDate}
                        disabled={!showRestFields}
                        type="date"
                        {...register("depositDate")}
                    />
                    <CustomizedInputWithLabel
                        label="Transaction Ref No"
                        required={true}
                        errors={errors.txnRefNo}
                        placeholder=""
                        disabled={!showRestFields}
                        {...register("txnRefNo")}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Bank Name"
                        required={true}
                        errors={errors.bank}
                        list={bankList}
                        disabled={!showRestFields}
                        {...register("bank")}
                    />
                    <CustomizedInputWithLabel
                        label="Deposit Slip"
                        required={true}
                        errors={errors.depositSlip}
                        // disabled={!showRestFields}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        {...register("depositSlip")}
                    />
                </div>

                <div className="flex justify-end mt-4">
                    <Button type="submit" variant="default" disabled={isSubmitting || !showRestFields}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </div>
            </form >
        </AuthUserReusableCode >
    );
};

export default AgentBankDeposit;
