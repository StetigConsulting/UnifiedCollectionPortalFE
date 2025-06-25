'use client';

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deniedToPaySchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import CustomizedMultipleSelectInputWithLabelString from "@/components/CustomizedMultipleSelectInputWithLabelString";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { createDeniedToPay, fetchDeniedToPayData, getDeniedToPayData, getPaidReason, updateDeniedToPay } from "@/app/api-calls/admin/api";
import { useSession } from "next-auth/react";
import { DeniedToPayInterface } from "@/lib/interface";
import { urlsListWithTitle } from "@/lib/utils";

type FormData = z.infer<typeof deniedToPaySchema>;

const SetupDeniedToPay = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deniedToPayData, setDeniedToPayData] = useState([]);
    const [paidReason, setPaidReason] = useState([]);
    const [existingId, setExistingId] = useState<number | null>(null);

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
        resolver: zodResolver(deniedToPaySchema),
    });

    const formData = watch();

    const onSubmit = async (data: FormData) => {
        try {
            let payload: DeniedToPayInterface = {
                "discom_id": session?.user?.discomId,
                "office_structure_id": session?.user?.discomId,
                "rule_level": "Discomwise",
                "rule_name": "DENIED_TO_PAY",
                "json_rule": {
                    "max_limit": data.maxCountPerDay,
                    "denied_to_pay_reasons": data.deniedReason,
                    "paid_reasons": data.paidReason
                }
            }
            setIsSubmitting(true);

            if (existingId) {
                payload.id = existingId;
            }

            let response = null;
            if (existingId) {
                response = await updateDeniedToPay(payload)
            } else {
                response = await createDeniedToPay(payload);
            }

            toast.success(response.message);
            router.push(urlsListWithTitle.deniedToPay.url);
        } catch (error) {
            toast.error("Failed to submit the form.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const fetchDeniedToPay = async () => {
        setIsLoading(true);
        try {
            const data = await getDeniedToPayData();
            setDeniedToPayData(data.data.map((item) => ({ label: item.reason, value: item.reason })));
        } catch (error) {
            console.error('Error fetching denied to pay data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPaidReason = async () => {
        setIsLoading(true);
        try {
            const data = await getPaidReason();
            setPaidReason(data.data.map((item) => ({ label: item.reason, value: item.reason })));
        } catch (error) {
            console.error('Error fetching denied to paid reason:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchExistingDataForDeniedToPay = async () => {
        setIsLoading(true);
        try {
            const data = await fetchDeniedToPayData(session.user.discomId);
            const existingData = data.data[0];
            setExistingId(existingData.id);
            setValue('maxCountPerDay', existingData.json_rule.max_limit);
            setValue('deniedReason', existingData.json_rule.denied_to_pay_reasons);
            setValue('paidReason', existingData.json_rule.paid_reasons);
        } catch (error) {
            console.error('Error fetching existing denied to pay data:', error);
        }
    }

    useEffect(() => {
        fetchDeniedToPay();
        fetchPaidReason();
        fetchExistingDataForDeniedToPay();
    }, []);

    return (
        <AuthUserReusableCode pageTitle="Denied to Pay" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">

                <div className="space-y-2">
                    <CustomizedInputWithLabel
                        label="Denied to pay max count per day"
                        placeholder="Enter max count"
                        type="number"
                        errors={errors.maxCountPerDay}
                        {...register("maxCountPerDay", { valueAsNumber: true })}
                    />
                </div>

                <div className="space-y-2">
                    <CustomizedMultipleSelectInputWithLabelString
                        label="Denied to pay reason"
                        placeholder="Select reasons"
                        errors={errors.deniedReason}
                        required={true}
                        list={deniedToPayData}
                        value={watch('deniedReason') || []}
                        onChange={(selectedValues) => setValue('deniedReason', selectedValues)}
                        multi={true}
                    />
                </div>

                <div className="space-y-2">
                    <CustomizedMultipleSelectInputWithLabelString
                        label="Paid reason"
                        placeholder="Select paid reasons"
                        errors={errors.paidReason}
                        required={true}
                        list={paidReason}
                        value={watch('paidReason') || []}
                        onChange={(selectedValues) => setValue('paidReason', selectedValues)}
                        multi={true}
                    />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <Button variant="outline" type="button" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default SetupDeniedToPay;
