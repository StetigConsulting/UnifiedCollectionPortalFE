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

type FormData = z.infer<typeof deniedToPaySchema>;

const SetupDeniedToPay = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deniedToPayReasons, setDeniedToPayReasons] = useState([]);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(deniedToPaySchema),
    });

    const formData = watch();

    const onSubmit = async (data: FormData) => {
        console.log("Form Data:", data);
        try {
            setIsSubmitting(true);
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
                    {errors.deniedReason && <p className="text-red-600 text-sm">{errors.deniedReason.message}</p>}
                </div>

                <div className="space-y-2">
                    <CustomizedSelectInputWithLabel
                        label="Paid reason"
                        placeholder="Select paid reason"
                        list={[]}
                        errors={errors.paidReason}
                        {...register("paidReason")}
                    />
                </div>

                <div className="space-y-2">
                    <CustomizedInputWithLabel
                        label="Denied to pay max count per day"
                        placeholder="Enter max count"
                        type="number"
                        errors={errors.maxCountPerDay}
                        {...register("maxCountPerDay")}
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
