'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeSectionSchema } from '@/lib/zod';

type FormData = z.infer<typeof changeSectionSchema>;

const ChangeSection = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(changeSectionSchema),
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
    };

    return (
        <AuthUserReusableCode pageTitle="Change Section">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center gap-4">
                    <CustomizedInputWithLabel
                        label="Collector Mobile Number"
                        placeholder="Enter Mobile Number"
                        errors={errors.collectorMobileNumber}
                        containerClass="flex-1"
                        {...register('collectorMobileNumber')}
                    />
                    <Button type="button" variant="default" className="h-10 px-4">
                        Search
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Collector Name"
                        placeholder="Collector Name"
                        errors={errors.collectorName}
                        containerClass=""
                        {...register('collectorName')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Current Type"
                        placeholder="Current Type"
                        errors={errors.currentType}
                        containerClass=""
                        {...register('currentType')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Division"
                        placeholder="Division"
                        errors={errors.division}
                        containerClass="col-span-2"
                        {...register('division')}
                        disabled
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Sub Division"
                        placeholder="Select Sub Division"
                        list={[]}
                        errors={errors.subDivision}
                        {...register('subDivision')}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Section"
                        placeholder="Select Section"
                        list={[]}
                        errors={errors.section}
                        {...register('section')}
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

export default ChangeSection;
