"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetCollectorBalanceSchema, ResetCollectorFormData } from "@/lib/zod";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { Loader2 } from "lucide-react";

const ResetCollectorBalance = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ResetCollectorFormData>({
        resolver: zodResolver(resetCollectorBalanceSchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: ResetCollectorFormData) => {
        setIsSubmitting(true);
        try {

        } catch (error) {
            toast.error("An error occurred while resetting the balance");
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Reset Agent Balance" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Agent Mobile"
                        list={[]}
                        required={true}
                        errors={errors.collectorMobile}
                        containerClass="col-span-2"
                        {...register("collectorMobile")}
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        required={true}
                        errors={errors.agencyName}
                        disabled
                        placeholder="Enter Agency Name"
                        {...register("agencyName")}
                    />
                    <CustomizedInputWithLabel
                        label="Agency ID"
                        required={true}
                        errors={errors.agencyId}
                        disabled
                        placeholder="Enter Agency ID"
                        {...register("agencyId")}
                    />
                    <CustomizedInputWithLabel
                        label="Phone Number"
                        required={true}
                        errors={errors.phoneNumber}
                        disabled
                        placeholder="Enter Phone Number"
                        {...register("phoneNumber")}
                    />
                    <CustomizedInputWithLabel
                        label="Transaction Type"
                        value="Reset"
                        disabled
                        required={true}
                        errors={errors.transactionType}
                        {...register("transactionType")}
                    />
                    <CustomizedInputWithLabel
                        label="Current Balance"
                        required={true}
                        containerClass="col-span-2"
                        errors={errors.currentBalance}
                        placeholder="Current Balance"
                        type="number"
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

                <div className="flex justify-end mt-4">
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </span>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default ResetCollectorBalance;
