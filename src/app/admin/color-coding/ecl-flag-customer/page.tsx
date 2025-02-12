'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import { z } from 'zod';
import { colorCodingEclSchema } from '@/lib/zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createColorCodingEcl, getColorCodingEclFlag, updateColorCodingEcl } from '@/app/api-calls/admin/api';
import { useSession } from 'next-auth/react';

type BackgroundColorFormType = z.infer<typeof colorCodingEclSchema>;

const ECLFlaggedCustomer = () => {
    const { data: session } = useSession()
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<BackgroundColorFormType>({
        resolver: zodResolver(colorCodingEclSchema),
        defaultValues: {
            id: null,
            backgroundColor: '',
        },
    });

    const backgroundColor = watch('backgroundColor');

    const onSubmit = async (data: BackgroundColorFormType) => {
        try {
            let payload = {
                id: data.id,
                discom_id: session?.user?.discomId,
                office_structure_id: session?.user?.discomId,
                rule_level: "Discomwise",
                rule_name: "ECL_FLAGGED_CUSTOMER_COLOR_CODING",
                json_rule: {
                    bg_color_code: data.backgroundColor
                }

            }
            let response: any;
            if (data.id) {
                response = await updateColorCodingEcl(payload);
            } else {
                response = await createColorCodingEcl(payload);
            }
            console.log('Submitting Data:', response.data);
            toast.success("'ECL Flagged Customer's Bill Background Updated Successfully");
            router.push('/admin/color-coding');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error: ' + error?.error);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleBackgroundColorChange = (data: string) => {
        setValue('backgroundColor', data);
    };

    useEffect(() => {
        getEclFlagCustomer()
    }, [])

    const getEclFlagCustomer = async () => {
        setIsLoading(true);
        try {
            const response = await getColorCodingEclFlag(session?.user?.discomId);
            setValue('backgroundColor', response?.data?.[0]?.json_rule?.bg_color_code || '');
            setValue('id', response?.data?.[0]?.id || null)
            console.log(response);
        } catch (error) {
            console.error('Failed to get agency:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthUserReusableCode pageTitle="ECL Flagged Customer" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Background Color</label>
                    <div className="flex items-center space-x-2">
                        <div className="w-full">
                            <CustomizedInputWithLabel
                                type="text"
                                value={backgroundColor}
                                readOnly
                                errors={errors.backgroundColor}
                            />
                        </div>
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => handleBackgroundColorChange(e.target.value)}
                            className="w-10 h-10 border rounded-full cursor-pointer self-start"
                        />
                    </div>
                </div>


                <div className="mt-6 text-right space-x-4">
                    <Button variant="outline" type="button" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Save'}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default ECLFlaggedCustomer;
