'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedMultipleSelectInputWithLabelString from '@/components/CustomizedMultipleSelectInputWithLabelString';
import { AddModeOfPaymentFormData, addModeOfPaymentSchema } from '@/lib/zod';
import { z } from 'zod';

const paymentModesList = [
    { label: "Cash", value: "Cash" },
    { label: "Cheque", value: "Cheque" },
    { label: "DD", value: "DD" },
    { label: "Activate", value: "Activate" }
];

const AddPaymentConfiguration: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<AddModeOfPaymentFormData>({
        resolver: zodResolver(addModeOfPaymentSchema),
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const onSubmit = async (data: AddModeOfPaymentFormData) => {
        setIsSubmitting(true);
        try {
            console.log('Submitted Data:', data);
            toast.success('Payment Modes Updated Successfully!');
        } catch (error) {
            toast.error('An error occurred while saving.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Mode Of Payment">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <CustomizedMultipleSelectInputWithLabelString
                    label="Select Payment mode"
                    errors={errors.paymentModes}
                    placeholder="Select Payment mode"
                    list={paymentModesList}
                    required
                    value={watch('paymentModes') || []}
                    multi
                    onChange={(selectedValues) => setValue('paymentModes', selectedValues)}
                />
                <div className="flex justify-end gap-4 mt-4">
                    <Button type="button" variant="outline">Cancel</Button>
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default AddPaymentConfiguration;
