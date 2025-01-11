'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extendValiditySchema } from '@/lib/zod';
import { z } from 'zod';

type FormData = z.infer<typeof extendValiditySchema>;

const ExtendValidity = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(extendValiditySchema),
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
    };

    return (
        <AuthUserReusableCode pageTitle="Extend Validity">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Circle"
                        errors={errors.circle}
                        containerClass=""
                        placeholder="Select Circle Type"
                        list={[]}
                        {...register('circle')}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Division"
                        errors={errors.division}
                        containerClass=""
                        placeholder="Select Division"
                        list={[]}
                        {...register('division')}
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        errors={errors.agencyName}
                        containerClass="col-span-2"
                        placeholder="Select Agency Name"
                        {...register('agencyName')}
                    />
                    <CustomizedInputWithLabel
                        label="Agency ID"
                        errors={errors.agencyId}
                        containerClass=""
                        placeholder="Agency ID"
                        {...register('agencyId')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Current Validity"
                        errors={errors.currentValidity}
                        containerClass=""
                        placeholder="Current Validity"
                        {...register('currentValidity')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Validity Date"
                        errors={errors.validityDate}
                        containerClass=""
                        placeholder="Choose Validity Date"
                        type="date"
                        {...register('validityDate')}
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

export default ExtendValidity;
