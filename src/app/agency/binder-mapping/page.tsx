'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { binderMappingSchema, BinderMappingFormData } from '@/lib/zod';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';

// Define the types for the state data
interface SelectOption {
    value: string;
    label: string;
}

const BinderMapping = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BinderMappingFormData>({
        resolver: zodResolver(binderMappingSchema),
    });

    const [isLoading, setIsLoading] = useState(false);

    const [binders, setBinders] = useState<SelectOption[]>([]);
    const [subDivisions, setSubDivisions] = useState<SelectOption[]>([]);
    const [sections, setSections] = useState<SelectOption[]>([]);
    const [divisions, setDivisions] = useState<SelectOption[]>([]);

    useEffect(() => {
        // API calls can be un-commented when required
        // getBinders().then(setBinders);
        // getSubDivisions().then(setSubDivisions);
        // getSections().then(setSections);
        // getDivisions().then(setDivisions);
    }, []);

    const onSubmit = async (data: BinderMappingFormData) => {
        try {
            // const response = await createBinderMapping(data);
            toast.success('Binder Mapping saved successfully!');
        } catch (error) {
            toast.error('Failed to save binder mapping.');
            console.error('Error:', error);
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Pseudo Level Mapping" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Collector Mobile"
                        placeholder="Enter Collector Mobile"
                        containerClass="col-span-2"
                        required
                        {...register('collectorMobile')}
                        errors={errors.collectorMobile}
                    />
                    <CustomizedInputWithLabel
                        label="Agent ID"
                        placeholder="Enter Agent ID"
                        disabled
                        {...register('agentId')}
                        errors={errors.agentId}
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        disabled
                        {...register('agencyName')}
                        errors={errors.agencyName}
                    />
                    <CustomizedInputWithLabel
                        label="Agent Mobile Number"
                        placeholder="Enter Agent Mobile Number"
                        disabled
                        {...register('agentMobileNumber')}
                        errors={errors.agentMobileNumber}
                    />

                    <CustomizedSelectInputWithLabel
                        label="Division"
                        list={divisions}
                        disabled
                        {...register('division')}
                        errors={errors.division}
                    />
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">Binder:</label>
                        <div className="grid grid-cols-4 gap-4 mt-2">
                            {binders.map((binder) => (
                                <div key={binder.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={binder.value}
                                        value={binder.value}
                                        className="mr-2"
                                        {...register('binder')}
                                    />
                                    <label htmlFor={binder.value} className="text-sm">{binder.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">Already Allocated Binder:</label>
                        <div className="grid grid-cols-4 gap-4 mt-2">
                            {binders.map((binder) => (
                                <div key={binder.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`allocated-${binder.value}`}
                                        value={binder.value}
                                        className="mr-2"
                                        disabled
                                        {...register('allocatedBinder')}
                                    />
                                    <label htmlFor={`allocated-${binder.value}`} className="text-sm">{binder.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default BinderMapping;
