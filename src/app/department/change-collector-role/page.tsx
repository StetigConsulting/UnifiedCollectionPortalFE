'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeCollectorRoleSchema } from '@/lib/zod';
import { changeAgentRole, getAgentDetailsById, getAllNonEnergyTypes } from '@/app/api-calls/department/api';
import CustomizedMultipleSelectInputWithLabelString from '@/components/CustomizedMultipleSelectInputWithLabelString';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

type FormData = z.infer<typeof changeCollectorRoleSchema>;

const ChangeCollectorRole = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
        resolver: zodResolver(changeCollectorRoleSchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(true)

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        try {
            let payload = {
                "agent_id": 45, //hardcoded
                "collection_type_energy": data.collectionType.includes('Energy'),
                "collection_type_non_energy": data.collectionType.includes('Non-Energy'),
                non_energy_types: data.nonEnergy
            }
            await changeAgentRole(payload);
            toast.success('Counter Collector added successfully!');
            reset()
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
        }
    };

    const [isLoading, setIsLoading] = useState(false)

    const getAgentDetails = async () => {
        setIsLoading(true);
        try {
            const response = await getAgentDetailsById(45);//hardcoded
            if (response) {
                setValue('collectorName', response.data?.agent_name || '');
                setValue('currentType', response.data?.currentType || '');
                setValue('division', response.data?.working_level_office.office_description || '');
            }
        } catch (error) {
            console.error('Error fetching agent details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const [nonEnergyTypes, setNonEnergyTypes] = useState([]);

    useEffect(() => {
        setIsLoading(true)
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
        }).catch(() => setIsLoading(false));
    }, []);


    return (
        <AuthUserReusableCode pageTitle="Change Agent Role" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center gap-4">
                    <CustomizedInputWithLabel
                        label="Agent Mobile Number"
                        placeholder="Enter Mobile Number"
                        errors={errors.collectorMobileNumber}
                        containerClass="flex-1"
                        {...register('collectorMobileNumber')}
                    />
                    <Button type="button" variant="default" className="h-10 px-4" onClick={getAgentDetails}>
                        Search
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Collector Name"
                        placeholder="Collector Name"
                        disabled
                        errors={errors.collectorName}
                        containerClass=""
                        {...register('collectorName')}
                    />
                    <CustomizedInputWithLabel
                        label="Current Type"
                        placeholder="Current Type"
                        disabled
                        errors={errors.currentType}
                        containerClass=""
                        {...register('currentType')}
                    />
                    <CustomizedInputWithLabel
                        label="Division"
                        placeholder="Division"
                        disabled
                        errors={errors.division}
                        containerClass="col-span-2"
                        {...register('division')}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                    <CustomizedSelectInputWithLabel
                        label="Allow Recovery"
                        placeholder="Select Recovery Mode"
                        list={[{ label: 'Yes', value: 'Yes' }, {
                            label: 'No', value: 'No'
                        }]}
                        errors={errors.allowRecovery}
                        {...register('allowRecovery')}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" variant="default" className="h-10 px-8">
                        Change
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default ChangeCollectorRole;