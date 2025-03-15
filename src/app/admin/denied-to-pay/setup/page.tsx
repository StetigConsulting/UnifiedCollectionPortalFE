'use client';

import React, { useState } from "react";
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
import { createDeniedToPay } from "@/app/api-calls/admin/api";
import { useSession } from "next-auth/react";

type FormData = z.infer<typeof deniedToPaySchema>;

const SetupDeniedToPay = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deniedToPayReasons, setDeniedToPayReasons] = useState([]);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(deniedToPaySchema),
    });

    const formData = watch();

    const onSubmit = async (data: FormData) => {
        console.log("Form Data:", data);
        try {
            let payload = {
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

            const response = await createDeniedToPay(payload);
            toast.success("Form submitted successfully!");
        } catch (error) {
            toast.error("Failed to submit the form.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <AuthUserReusableCode pageTitle="Denied to Pay">
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
                        list={deniedToPayReasons}
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
                        list={[]}
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
