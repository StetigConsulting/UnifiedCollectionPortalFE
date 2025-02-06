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
import { extendAgentValidityById, getAllAgentByAgencyId } from "@/app/api-calls/agency/api";
import { testAgencyId } from "@/lib/utils";

const ExtendValidity = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm<ExtendValidityCollectorFormData>({
        resolver: zodResolver(extendValiditySchemaCollector),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agencies, setAgencies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getAgentList()
    }, []);

    const onSubmit = async (data: ExtendValidityCollectorFormData) => {
        let payload = {
            "agent_id": data.collectorId,
            "validity_from_date": data.validityDateFrom,
            "validity_to_date": data.validityDateTo
        }
        try {
            setIsSubmitting(true);
            const response = await extendAgentValidityById(payload, testAgencyId);
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

    const selectedAgency = watch('collectorName');
    const formData = watch();

    useEffect(() => {
        if (selectedAgency) {
            const agency = agencies.find((item) => item.id === Number(selectedAgency));
            if (agency) {
                setValue('collectorId', agency.id || null);
                setValue('currentValidityFrom', agency.validity_from_date || '');
                setValue('currentValidityTo', agency.validity_to_date || '');
            }
        }
    }, [selectedAgency, agencies, setValue]);

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
                        label="Current Validity From"
                        required={true}
                        errors={errors.currentValidityFrom}
                        placeholder="Current Validity From"
                        disabled
                        {...register("currentValidityFrom")}
                    />
                    <CustomizedInputWithLabel
                        label="Current Validity To"
                        required={true}
                        errors={errors.currentValidityTo}
                        placeholder="Current Validity From"
                        disabled
                        {...register("currentValidityTo")}
                    />
                    <CustomizedInputWithLabel
                        label="Validity Date"
                        required={true}
                        errors={errors.validityDateFrom}
                        type="date"
                        {...register("validityDateFrom")}
                    />
                    <CustomizedInputWithLabel
                        label="Validity Date"
                        required={true}
                        errors={errors.validityDateTo}
                        type="date"
                        {...register("validityDateTo")}
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
