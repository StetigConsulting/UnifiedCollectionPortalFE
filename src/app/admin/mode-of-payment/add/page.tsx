'use client';

import React, { useEffect, useState } from 'react';
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
import { getErrorMessage, urlsListWithTitle } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getAllGlobalPaymentMode, getAllPaymentModes } from '@/app/api-calls/department/api';
import { Loader2 } from 'lucide-react';

const AddPaymentConfiguration: React.FC = () => {
    const router = useRouter();
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
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [paymentModesList, setPaymentModesList] = useState([])

    const onSubmit = async (data: AddModeOfPaymentFormData) => {
        setIsSubmitting(true);
        try {
            let payload: PaymentModeUpdateInterface = {
                discom_id: session.user.discomId,
                payment_modes: data.paymentModes
            }
            const response = await updatePaymentMode(payload);
            toast.success('Non Energy Type Updated Successfully!');
            router.push(urlsListWithTitle.modeOfPayment.url);
        } catch (error) {
            toast.error('Error: ' + (error.error));
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPicklist = async () => {
        try {
            setIsLoading(true)
            const response = await getAllGlobalPaymentMode();
            setPaymentModesList(response.data
                ?.filter((ite) => ite.mode_type == "Collection")
                .map((item) => ({ label: item.mode_name, value: item.id })));
            // setValue('paymentModes', response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false)
        }
    }

    const fetchPaymentMethods = async () => {
        setIsLoading(true);
        try {
            const response = await getAllPaymentModes();
            setValue('paymentModes', response.data.map((item => item?.id)));
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getPicklist()
        fetchPaymentMethods()
    }, [])

    return (
        <AuthUserReusableCode pageTitle="Mode Of Payment" isLoading={isLoading || isSubmitting}>
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
                    <Button type="button" variant="outline" onClick={() => { router.push(urlsListWithTitle.modeOfPayment.url) }}>Cancel</Button>
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </> : "Save"}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default AddPaymentConfiguration;
