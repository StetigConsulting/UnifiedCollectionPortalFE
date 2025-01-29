'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addCounterCollectorSchema, AddCounterCollectorFormData } from '@/lib/zod';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CustomizedMultipleSelectInputWithLabelString from '@/components/CustomizedMultipleSelectInputWithLabelString';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';

interface SelectOption {
    value: string;
    label: string;
}

const AddCounterCollector = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AddCounterCollectorFormData>({
        resolver: zodResolver(addCounterCollectorSchema),
    });

    const [isLoading, setIsLoading] = useState(false);

    const [binders, setBinders] = useState<SelectOption[]>([]);
    const [subDivisions, setSubDivisions] = useState<SelectOption[]>([]);
    const [sections, setSections] = useState<SelectOption[]>([]);
    const [permissions, setPermissions] = useState<SelectOption[]>([]);
    const [collectionTypes, setCollectionTypes] = useState<SelectOption[]>([]);
    const [nonEnergyTypes, setNonEnergyTypes] = useState<SelectOption[]>([]);

    // Fetching data (mocked as comments for now)
    useEffect(() => {
        // getBinders().then(setBinders);
        // getSubDivisions().then(setSubDivisions);
        // getSections().then(setSections);
        // getPermissions().then(setPermissions);
        // getCollectionTypes().then(setCollectionTypes);
        // getNonEnergyTypes().then(setNonEnergyTypes);
    }, []);

    const onSubmit = async (data: AddCounterCollectorFormData) => {
        try {
            // const response = await createCounterCollector(data);
            toast.success('Counter Collector added successfully!');
        } catch (error) {
            toast.error('Failed to add Counter Collector.');
            console.error('Error:', error);
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
                        label="Phone Number"
                        placeholder="Enter Phone Number"
                        required
                        {...register('phoneNumber')}
                        errors={errors.phoneNumber}
                    />
                    <CustomizedInputWithLabel
                        label="Maximum Limit"
                        type="number"
                        placeholder="Enter Maximum Limit"
                        required
                        {...register('maximumLimit')}
                        errors={errors.maximumLimit}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Validity"
                        list={[]}
                        required
                        {...register('validity')}
                        errors={errors.validity}
                    />
                    <CustomizedInputWithLabel
                        label="Initial Balance"
                        type="number"
                        placeholder="Enter Initial Balance"
                        required
                        {...register('initialBalance')}
                        errors={errors.initialBalance}
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
                        required
                        multi={true}
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

export default AddCounterCollector;
