'use client';

import React from 'react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentUserSchema } from '@/lib/zod';
import { useRouter } from 'next/navigation';

type FormData = z.infer<typeof departmentUserSchema>;

const CreateDepartmentUserForm = () => {
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(departmentUserSchema),
    });

    const onSubmit = (data: FormData) => {
        // Remove console.log statements
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <AuthUserReusableCode pageTitle="Create Department User">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Name"
                        placeholder="Enter Department Name"
                        errors={errors.name}
                        {...register('name')}
                    />
                    <CustomizedInputWithLabel
                        label="Phone Number"
                        placeholder="Enter Phone Number"
                        errors={errors.phoneNumber}
                        {...register('phoneNumber')}
                    />
                    <CustomizedInputWithLabel
                        label="Email"
                        placeholder="Enter email"
                        type="email"
                        errors={errors.email}
                        {...register('email')}
                    />
                </div>
                <div className="flex justify-end space-x-4">
                    <Button onClick={handleCancel} variant="outline" type="button">
                        Cancel
                    </Button>
                    <Button type="submit" variant="default">
                        Save
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default CreateDepartmentUserForm;
