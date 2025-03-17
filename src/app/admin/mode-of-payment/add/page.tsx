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
import { useSession } from 'next-auth/react';
import { PaymentModeUpdateInterface } from '@/lib/interface';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { updatePaymentMode } from '@/app/api-calls/admin/api';
import { getErrorMessage } from '@/lib/utils';

const paymentModesList = [
    { label: "Cash", value: 1 },
    { label: "Cheque", value: 2 },
    { label: "DD", value: 3 },
    { label: "Activate", value: 4 }
];

const AddPaymentConfiguration: React.FC = () => {

    const { data: session } = useSession();

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
            let payload: PaymentModeUpdateInterface = {
                discom_id: session.user.discomId,
                payment_modes: data.paymentModes
            }
            const response = await updatePaymentMode(payload);
            toast.success('Payment Modes Updated Successfully!');
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <AuthUserReusableCode pageTitle="Mode Of Payment">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <CustomizedMultipleSelectInputWithLabelNumber
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
