"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { extendValiditySchemaCollector, ExtendValidityCollectorFormData } from "@/lib/zod";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import { Button } from "@/components/ui/button";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { Loader2 } from "lucide-react";

interface SelectOption {
    value: string;
    label: string;
}

const ExtendValidity = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ExtendValidityCollectorFormData>({
        resolver: zodResolver(extendValiditySchemaCollector),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agencies, setAgencies] = useState<SelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch agencies data
        // Example: getAgencies().then(setAgencies);
    }, []);

    const onSubmit = async (data: ExtendValidityCollectorFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/extend-validity", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success("Validity extended successfully");
            } else {
                toast.error("Failed to extend validity");
            }
        } catch (error) {
            toast.error("An error occurred while extending validity");
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Extend Validity" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Collector Name"
                        list={agencies}
                        required={true}
                        containerClass="col-span-2"
                        errors={errors.collectorName}
                        {...register("collectorName")}
                    />
                    <CustomizedInputWithLabel
                        label="Collector ID"
                        required={true}
                        errors={errors.collectorId}
                        disabled
                        placeholder="Enter Collector ID"
                        {...register("collectorId")}
                    />
                    <CustomizedInputWithLabel
                        label="Current Validity"
                        required={true}
                        errors={errors.currentValidity}
                        placeholder="Current Validity"
                        disabled
                        {...register("currentValidity")}
                    />
                    <CustomizedInputWithLabel
                        label="Validity Date"
                        required={true}
                        errors={errors.validityDate}
                        type="date"
                        {...register("validityDate")}
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

export default ExtendValidity;
