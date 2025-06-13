'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { CreateUserFormData, createUserSchema } from '@/lib/zod';
import { createUser, getAllUserRoles } from '@/app/api-calls/admin/api';
import { getErrorMessage } from '@/lib/utils';

const CreateUserForm = () => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserSchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [userRolesList, setUserRolesList] = useState([]);

    const onSubmit = async (data: CreateUserFormData) => {
        setIsSubmitting(true);
        try {
            let payload = {
                user_role_id: data.userRole,
                user_name: data.name,
                mobile_number: data.phoneNumber
            }

            const response = await createUser(payload);
            console.log('Submitted Data:', data);
            toast.success("User Created Successfully!");
            reset();
        } catch (error) {
            toast.error("Error: " + getErrorMessage(error));
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAllUserRolePicklist = async () => {
        try {
            setIsLoading(true);
            const data = await getAllUserRoles();
            setUserRolesList(data?.data?.map((ite) => {
                return {
                    value: ite.id,
                    label: ite.role_name,
                };
            }));
        } catch (error) {
            console.error('Error fetching user roles:', getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getAllUserRolePicklist();
    }, [])

    return (
        <AuthUserReusableCode pageTitle='Create new User' isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <CustomizedSelectInputWithLabel
                    label="User Role"
                    required
                    list={userRolesList}
                    {...register('userRole', { valueAsNumber: true })}
                    errors={errors.userRole}
                />
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
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
                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default CreateUserForm;
