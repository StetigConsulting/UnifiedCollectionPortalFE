'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addCounterCollectorSchema, AddCounterCollectorFormData } from '@/lib/zod';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CustomizedMultipleSelectInputWithLabelString from '@/components/CustomizedMultipleSelectInputWithLabelString';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { getAllNonEnergyTypes, getAllPaymentModes } from '@/app/api-calls/department/api';
import { createCounterCollector } from '@/app/api-calls/agency/api';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { Loader2 } from 'lucide-react';

const AddCounterCollector = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<AddCounterCollectorFormData>({
        resolver: zodResolver(addCounterCollectorSchema),
        defaultValues: {
            initialBalance: 0
        },
    });

    const [isLoading, setIsLoading] = useState(false);

    const [permissions, setPermissions] = useState([]);
    const [nonEnergyTypes, setNonEnergyTypes] = useState([]);

    useEffect(() => {
        setIsLoading(true)
        getAllPaymentModes()
            .then((data) => {
                setPermissions(
                    data?.data
                        ?.filter((ite) => ite.mode_type == "Collection")
                        ?.map((ite) => {
                            return {
                                label: ite.mode_name,
                                value: ite.id,
                            };
                        })
                );
                setIsLoading(false)
            })
            .catch((err) => { })
        getAllNonEnergyTypes().then((data) => {
            setNonEnergyTypes(
                data?.data?.map((ite) => {
                    return {
                        label: ite.type_name,
                        value: ite.id,
                    };
                })
            );
            setIsLoading(false)
        })
        setValue('initialBalance', 0);
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: AddCounterCollectorFormData) => {
        setIsSubmitting(true)
        try {
            let payload = {
                "agency_id": 30, //hardcoded
                "agent_name": data.name,
                "primary_phone": data.personalPhoneNumber,
                "secondary_phone": data.officePhoneNumber,
                "maximum_limit": data.maximumLimit,
                "validity_from_date": data.fromValidity,
                "validity_to_date": data.toValidity,
                "collection_payment_modes": data.permission,
                "working_level": 68,//hardcoded
                "collection_type_energy": data.collectionType.includes('Energy'),
                "collection_type_non_energy": data.collectionType.includes('Non-Energy'),
                "is_active": true,
                "non_energy_types": data.nonEnergy,
                "working_level_office": 1325,//hardcoded
                "collector_type": 1,//hardcoded
                "work_type": "Offline",
                "collector_role": "Counter Collector"
            }
            await createCounterCollector(payload, 6);
            toast.success('Counter Collector added successfully!');
            reset()
        } catch (error) {
            let errorMessage = error?.data ? error?.data[Object.keys(error?.data)[0]] : error?.error;
            toast.error('Error: ' + errorMessage);
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false)
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Add Counter Collector" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        containerClass='col-span-2'
                        label="Name"
                        placeholder="Enter Name"
                        required
                        {...register('name')}
                        errors={errors.name}
                    />
                    <CustomizedInputWithLabel
                        label="Office Phone Number"
                        placeholder="Enter Phone Number"
                        required
                        {...register('officePhoneNumber')}
                        errors={errors.officePhoneNumber}
                    />
                    <CustomizedInputWithLabel
                        label="Personal Phone Number"
                        placeholder="Enter Phone Number"
                        required
                        {...register('personalPhoneNumber')}
                        errors={errors.personalPhoneNumber}
                    />
                    <CustomizedInputWithLabel
                        label="Maximum Limit"
                        type="number"
                        placeholder="Enter Maximum Limit"
                        required
                        {...register('maximumLimit', { valueAsNumber: true })}
                        errors={errors.maximumLimit}
                    />
                    <CustomizedInputWithLabel
                        label="Validity"
                        required
                        type='date'
                        {...register('fromValidity')}
                        errors={errors.fromValidity}
                    />
                    <CustomizedInputWithLabel
                        label="Validity"
                        required
                        type='date'
                        {...register('toValidity')}
                        errors={errors.toValidity}
                    />
                    <CustomizedInputWithLabel
                        label="Initial Balance"
                        type="number"
                        placeholder="Enter Initial Balance"
                        disabled
                        {...register('initialBalance')}
                        errors={errors.initialBalance}
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
                        errors={errors.collectionType}
                        placeholder="Select Collection"
                        list={[
                            { label: "Energy", value: "Energy" },
                            { label: "Non-Energy", value: "Non-Energy" },
                        ]}
                        required={true}
                        value={watch('collectionType') || []}
                        multi={true}
                        onChange={(selectedValues) => setValue('collectionType', selectedValues)}
                    />
                    {watch("collectionType")?.includes("Non-Energy") && (
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

export default AddCounterCollector;
