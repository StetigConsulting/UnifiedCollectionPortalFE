'use client';

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nonEnergyTypeSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import CustomizedMultipleSelectInputWithLabelString from "@/components/CustomizedMultipleSelectInputWithLabelString";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";

type FormData = z.infer<typeof nonEnergyTypeSchema>;

const NonEnergyType = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(nonEnergyTypeSchema),
    });

    const formData = watch();

    const onSubmit = async (data: FormData) => {
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

    const [noneEnergyTypeReason, setNonEnergyTypeReason] = useState([])

    return (
        <AuthUserReusableCode pageTitle="Non Energy Type">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <CustomizedMultipleSelectInputWithLabelString
                        label="Non Energy Type"
                        placeholder="Select reasons"
                        errors={errors.nonEnergyType}
                        required={true}
                        list={noneEnergyTypeReason}
                        value={watch('nonEnergyType') || []}
                        onChange={(selectedValues) => setValue('nonEnergyType', selectedValues)}
                        multi={true}
                    />
                    {errors.nonEnergyType && <p className="text-red-600 text-sm">{errors.nonEnergyType.message}</p>}
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

export default NonEnergyType;
