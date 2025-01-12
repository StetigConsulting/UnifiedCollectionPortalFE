'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeCollectorRoleSchema } from '@/lib/zod';

type FormData = z.infer<typeof changeCollectorRoleSchema>;

const ChangeCollectorRole = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(changeCollectorRoleSchema),
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
    };

    return (
        <AuthUserReusableCode pageTitle="Change Collector Role">
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
                    <CustomizedSelectInputWithLabel
                        label="Collection Type"
                        placeholder="Select Collection Type"
                        list={[]}
                        errors={errors.collectionType}
                        {...register('collectionType')}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Non Energy"
                        placeholder="Select Non Energy"
                        list={[]}
                        errors={errors.nonEnergy}
                        {...register('nonEnergy')}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Allow Recovery"
                        placeholder="Select Recovery Mode"
                        list={[]}
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