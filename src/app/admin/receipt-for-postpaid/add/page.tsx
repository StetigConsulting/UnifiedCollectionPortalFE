'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { addReceiptsSchema } from '@/lib/zod';

type FormData = z.infer<typeof addReceiptsSchema>;

const ReceiptsForPostpaid = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(addReceiptsSchema),
        defaultValues: {
            receipts: [
                {
                    applicableLevel: '',
                    circle: '',
                    division: '',
                    subDivision: '',
                    section: '',
                    receiptsPerMonth: 1,
                    receiptsPerDay: 1,
                    allowSecondReceipt: false,
                },
            ],
        },
    });

    const receipts = watch('receipts');

    const onSubmit = async (data: FormData) => {
        try {
            setIsSubmitting(true);
            toast.success('Form submitted successfully!');
        } catch (error) {
            toast.error('Failed to submit the form.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const addMoreReceipts = () => {
        setValue('receipts', [
            ...receipts,
            {
                applicableLevel: '',
                circle: '',
                division: '',
                subDivision: '',
                section: '',
                receiptsPerMonth: 1,
                receiptsPerDay: 1,
                allowSecondReceipt: false,
            },
        ]);
    };

    return (
        <AuthUserReusableCode pageTitle='Receipts for Postpaid'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <CustomizedSelectInputWithLabel
                    label='Config Rule'
                    list={[{ label: 'Levelwise', value: 'Levelwise' }]}
                    {...register('configRule')}
                />

                {receipts.map((_, index) => (
                    <div key={index} className='grid grid-cols-2 gap-4 p-4 rounded-lg'>
                        <CustomizedSelectInputWithLabel
                            label='Applicable Level'
                            list={[]}
                            {...register(`receipts.${index}.applicableLevel`)}
                        />
                        <CustomizedSelectInputWithLabel
                            label='Circle'
                            list={[]}
                            {...register(`receipts.${index}.circle`)}
                        />
                        <CustomizedSelectInputWithLabel
                            label='Division'
                            list={[]}
                            {...register(`receipts.${index}.division`)}
                        />
                        <CustomizedSelectInputWithLabel
                            label='Sub Division'
                            list={[]}
                            {...register(`receipts.${index}.subDivision`)}
                        />
                        <CustomizedSelectInputWithLabel
                            label='Section'
                            containerClass='col-span-2'
                            list={[{ label: 'Select section', value: '' }]}
                            {...register(`receipts.${index}.section`)}
                        />
                        <CustomizedInputWithLabel
                            label='Receipts per month against one bill'
                            type='number'
                            {...register(`receipts.${index}.receiptsPerMonth`, { valueAsNumber: true })}
                        />
                        <CustomizedInputWithLabel
                            label='Receipts per day against one bill'
                            type='number'
                            {...register(`receipts.${index}.receiptsPerDay`, { valueAsNumber: true })}
                        />
                        <div className='flex items-center space-x-2'>
                            <input type='checkbox' {...register(`receipts.${index}.allowSecondReceipt`)} />
                            <label>Second receipt is allowed with different payment mode</label>
                        </div>
                    </div>
                ))}



                <div className='mt-6 text-end space-x-4'>
                    <Button variant='outline' type='button' onClick={addMoreReceipts}>
                        + Add More
                    </Button>
                    <Button variant='outline' type='button' onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type='submit' variant='default' disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Submitting...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default ReceiptsForPostpaid;
