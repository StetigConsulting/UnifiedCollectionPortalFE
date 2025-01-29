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
// import { getAgencyList } from "@/app/api-calls/department/api";  // Assuming you have the API call for fetching data
import { Loader2 } from "lucide-react";

// Define the types for the state data
interface SelectOption {
    value: string;
    label: string;
}

const RechargeEntry = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<RechargeCollectorFormData>({
        resolver: zodResolver(rechargeSchemaCollector),
    });

    const [isLoading, setIsLoading] = useState(false);
    const [agencies, setAgencies] = useState<SelectOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // getAgencyList().then((data) => {
        //     setAgencies(
        //         data?.map((agency) => ({
        //             value: agency.id.toString(),
        //             label: agency.name,
        //         }))
        //     );
        // });
    }, []);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/recharge-entry", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                toast.success("Recharge successful");
            } else {
                toast.error("Failed to recharge");
            }
        } catch (error) {
            toast.error("An error occurred while recharging");
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        placeholder="Enter Agency ID"
                        {...register("agencyId")}
                    />
                    <CustomizedInputWithLabel
                        label="Phone Number"
                        required={true}
                        errors={errors.phoneNumber}
                        placeholder="Enter Phone Number"
                        disabled
                        {...register("phoneNumber")}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Agency Name"
                        list={agencies}
                        required={true}
                        errors={errors.agencyName}
                        disabled
                        {...register("agencyName")}
                    />
                    <CustomizedInputWithLabel
                        label="Transaction Type"
                        placeholder="Enter Transaction"
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
                        {...register("amount")}
                    />

                    <CustomizedInputWithLabel
                        label="Current Balance"
                        required={true}
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

                <div className="mt-4 p-4 border rounded-md flex bg-white">
                    <div className='flex-1 capitalize'>
                        <p>Recharge Amount: 500</p>
                        <p>Current Balance: 500</p>
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
