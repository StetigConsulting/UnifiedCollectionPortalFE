"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editCollectorSchema, EditCollectorFormData } from "@/lib/zod";
// import { createCollector } from "@/app/api-calls/collector/api";  // API call for form submission
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// import { getBinders, getSubDivisions, getSections, getPermissions, getCollectionTypes, getNonEnergyTypes } from "@/app/api-calls/collector/api";
import CustomizedMultipleSelectInputWithLabelString from "@/components/CustomizedMultipleSelectInputWithLabelString";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { getAgentByPhoneNumber } from "@/app/api-calls/department/api";
import { agentWorkingType, getErrorMessage } from "@/lib/utils";
import { getCollectorTypes } from "@/app/api-calls/agency/api";

const AddCollector = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, setError } = useForm<EditCollectorFormData>({
        resolver: zodResolver(editCollectorSchema),
    });

    const [isLoading, setIsLoading] = useState(false);

    const [collectorTypes, setCollectorTypes] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [collectionTypes, setCollectionTypes] = useState([]);
    const [nonEnergyTypes, setNonEnergyTypes] = useState([]);

    useEffect(() => {
        getCollectorTypes().then((data) => {
            setCollectorTypes(
                data?.data
                    ?.map((ite) => {
                        return {
                            label: ite.name,
                            value: ite.id,
                        };
                    })
            );
            setIsLoading(false)
        })
    }, []);

    const onSubmit = async (data: EditCollectorFormData) => {
        try {
            toast.success("Collector added successfully!");
        } catch (error) {
            toast.error("Failed to add collector.");
            console.error("Error:", error);
        }
    };

    const [showRestFields, setShowRestFields] = useState(false);

    const handleGetAgentData = async () => {
        const mobileNumber = Number(watch('collectorMobile'));
        if (!isNaN(mobileNumber) && mobileNumber.toString().length === 10) {
            try {
                setIsLoading(true);
                const response = await getAgentByPhoneNumber(mobileNumber);
                setValue('name', response.data.agent_name)
                setValue('phoneNumber', response.data.secondary_phone || '');
                setValue('collectorType', response.data.collector_type.id)
                setValue('workingType', response.data.work_type)
                // setShowRestFields(true)
                // getListOfAllBinders(response.data.id)
            } catch (error) {
                console.log(error.message);
                let errorMessage = getErrorMessage(error);
                toast.error('Error: ' + errorMessage || error.message)
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
        <AuthUserReusableCode pageTitle="Edit Collector" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className='space-y-2 col-span-2'>
                        <div className="col-span-2">
                            <CustomizedInputWithLabel
                                label="Collector Mobile"
                                type="text"
                                {...register('collectorMobile', { valueAsNumber: true })}
                                onChange={() => {
                                    // clearErrors("collectorMobile")
                                    // setValue('agencyName', '')
                                    // setValue('agentId', null)
                                    // setValue('agentMobileNumber', '')
                                    // setValue('division', null)
                                    // setListOfAvailableBinders([])
                                    // setShowRestFields(false)
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
                    <CustomizedInputWithLabel
                        label="Collector Name"
                        placeholder="Enter Name"
                        disabled
                        {...register("name")}
                        errors={errors.name}
                    />
                    <CustomizedInputWithLabel
                        label="Personal Phone Number"
                        placeholder="Enter Phone Number"
                        required
                        {...register("phoneNumber")}
                        errors={errors.phoneNumber}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Collector Type"
                        list={collectorTypes}
                        {...register("collectorType")}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Working Type"
                        list={agentWorkingType}
                        {...register("workingType")}
                    />
                    <CustomizedMultipleSelectInputWithLabelString
                        label="Permission"
                        list={permissions}
                        multi={true}
                        required={true}
                        placeholder="Select Permissions"
                        errors={errors.permission}
                        value={watch('permission') || []}
                        onChange={(selectedValues) => setValue('permission', selectedValues)}
                    />
                    <CustomizedMultipleSelectInputWithLabelString
                        label="Collection Type"
                        list={collectionTypes}
                        multi={true}
                        required={true}
                        placeholder="Select Collection Type"
                        errors={errors.collectionType}
                        value={watch('collectionType') || []}
                        onChange={(selectedValues) => setValue('collectionType', selectedValues)}
                    />

                    {watch("collectionType")?.includes("Non Energy") && (
                        <CustomizedMultipleSelectInputWithLabelString
                            label="Non Energy"
                            list={nonEnergyTypes}
                            multi={true}
                            required={true}
                            placeholder="Select Non Energy"
                            errors={errors.nonEnergy}
                            value={watch('nonEnergy') || []}
                            onChange={(selectedValues) => setValue('nonEnergy', selectedValues)}
                        />
                    )}
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default AddCollector;
