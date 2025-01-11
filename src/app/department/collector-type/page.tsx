'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useForm } from 'react-hook-form';

const ChangeCollectorType = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data: any) => {
        console.log(data);
    };

    return (
        <AuthUserReusableCode pageTitle="Change Collector Type">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                    <CustomizedInputWithLabel
                        label="Collector Mobile Number"
                        errors={errors.mobileNumber}
                        containerClass="col-span-2"
                        placeholder="Enter Mobile Number"
                        {...register("mobileNumber")}
                    />
                    <Button type="button" variant="default" className="mt-6">
                        Search
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Collector Name"
                        errors={errors.collectorName}
                        containerClass=""
                        placeholder="Collector Name"
                        {...register("collectorName")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Current Type"
                        errors={errors.currentType}
                        containerClass=""
                        placeholder="Current Type"
                        {...register("currentType")}
                        disabled
                    />
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Change Collector Type"
                        errors={errors.collectorType}
                        containerClass=""
                        placeholder="Select Collector Type"
                        list={[]}
                        {...register("collectorType")}
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit" variant="default">
                        Submit
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default ChangeCollectorType;
