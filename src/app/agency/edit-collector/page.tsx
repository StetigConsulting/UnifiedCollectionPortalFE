"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editCollectorSchema, EditCollectorFormData } from "@/lib/zod";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CustomizedMultipleSelectInputWithLabelString from "@/components/CustomizedMultipleSelectInputWithLabelString";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { getAgencyById, getAgentByPhoneNumber } from "@/app/api-calls/department/api";
import { agentWorkingType, getErrorMessage } from "@/lib/utils";
import { editCollectorData, getCollectorTypes } from "@/app/api-calls/agency/api";
import CustomizedMultipleSelectInputWithLabelNumber from "@/components/CustomizedMultipleSelectInputWithLabelNumber";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

const EditCollector = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, setError, reset } = useForm<EditCollectorFormData>({
        resolver: zodResolver(editCollectorSchema),
    });

    const { data: session } = useSession()
    const currentUserId = session?.user?.userId

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [collectorTypes, setCollectorTypes] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [collectionTypes, setCollectionTypes] = useState(
        [
            { label: "Energy", value: "Energy" },
            { label: "Non Energy", value: "Non Energy" },
        ]);
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
        setIsSubmitting(true)
        try {
            let payload = {
                "agent_id": data.agentId,
                "collection_payment_modes": data.permission,
                "collection_type_energy": data.collectionType.includes("Energy") ? true : false,
                "collection_type_non_energy": data.collectionType.includes("Non Energy") ? true : false,
                "non_energy_types": data.collectionType.includes("Non Energy") ? data.nonEnergy : [],
                "collector_type": data.collectorType,
                "work_type": data.workingType
            }
            await editCollectorData(payload, currentUserId);
            toast.success('Agent edited successfully!');
            reset()
        } catch (error) {
            let errorMessage = getErrorMessage(error);
            toast.error('Error: ' + errorMessage);
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false)
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
                setValue('agentId', response.data.id)
                getAgencyData(response.data.agency.id)
                setValue('permission', response.data.collection_payment_modes.map((ite) => ite.id))
                let collectionType = []
                if (response.data.collection_type_energy) {
                    collectionType.push('Energy')
                }
                if (response.data.collection_type_non_energy) {
                    collectionType.push('Non Energy')
                }
                setValue('collectionType', collectionType)
                setValue('nonEnergy', response.data.non_energy_types.map((ite) => ite.id))
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

    const [agencyData, setAgencyData] = useState({})

    const getAgencyData = async (id: number) => {
        try {
            const agencyResponse = await getAgencyById(String(id));
            const agencyData = agencyResponse.data;
            console.log("agencyData", agencyData);
            setAgencyData(agencyData);

            setPermissions(agencyData?.collection_payment_modes
                ?.map((ite) => {
                    return {
                        label: ite.mode_name,
                        value: ite.id,
                    };
                }))

            setNonEnergyTypes(
                agencyData?.non_energy_types?.map((ite) => {
                    return {
                        label: ite.type_name,
                        value: ite.id,
                    };
                })
            );

        } catch (error) {
            console.error("Error fetching agency data:", error);
        }
    };

    console.log(errors, watch())

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
                        disabled
                        {...register("phoneNumber")}
                        errors={errors.phoneNumber}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Collector Type"
                        list={collectorTypes}
                        {...register("collectorType")}
                        errors={errors.collectorType}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Working Type"
                        list={agentWorkingType}
                        {...register("workingType")}
                        errors={errors.workingType}
                    />
                    <CustomizedMultipleSelectInputWithLabelNumber
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
                        <CustomizedMultipleSelectInputWithLabelNumber
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
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default EditCollector;
