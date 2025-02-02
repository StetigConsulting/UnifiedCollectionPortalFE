'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addIncentiveSchema } from '@/lib/zod';
import { Button } from '@/components/ui/button';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

type FormData = z.infer<typeof addIncentiveSchema>;

const EditIncentivePage = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(addIncentiveSchema),
    });

    useEffect(() => {
        const fetchedData = {
            applicableLevel: 'Level 1',
            circle: 'Circle 1',
            division: 'Division 1',
            subDivision: 'SubDivision A',
            section: 'Section 1',
            currentPercentage: 5,
            arrearPercentage: 10,
        };

        setValue('applicableLevel', fetchedData.applicableLevel);
        setValue('circle', fetchedData.circle);
        setValue('division', fetchedData.division);
        setValue('subDivision', fetchedData.subDivision);
        setValue('section', fetchedData.section);
        setValue('currentPercentage', fetchedData.currentPercentage);
        setValue('arrearPercentage', fetchedData.arrearPercentage);
    }, []);

    const handleSave = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            // await fetch('/api/save-incentive', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data),
            // });
            toast.success('Incentive data saved!');
        } catch (error) {
            console.error('Error saving incentive:', error);
            toast.error('Failed to save incentive.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            // await fetch('/api/delete-incentive', {
            //     method: 'DELETE',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ id: incentiveData.id }),
            // });
            toast.success('Incentive deleted successfully');
            router.push('/incentive');
        } catch (error) {
            console.error('Error deleting incentive:', error);
            toast.error('Failed to delete incentive.');
        }
    };

    const handleCancel = () => {
        router.push('/incentive');
    };

    return (
        <AuthUserReusableCode pageTitle="Edit Incentive">
            <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <CustomizedSelectInputWithLabel
                            label="Applicable Level"
                            list={[
                                { label: 'Select applicable level', value: '' },
                                { label: 'Level 1', value: 'Level 1' },
                                { label: 'Level 2', value: 'Level 2' },
                            ]}
                            {...register('applicableLevel')}
                            errors={errors.applicableLevel?.message}
                        />

                        <CustomizedSelectInputWithLabel
                            label="Circle"
                            list={[
                                { label: 'Select circle', value: '' },
                                { label: 'Circle 1', value: 'Circle 1' },
                                { label: 'Circle 2', value: 'Circle 2' },
                            ]}
                            {...register('circle')}
                            errors={errors.circle?.message}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <CustomizedSelectInputWithLabel
                            label="Division"
                            list={[
                                { label: 'Select division', value: '' },
                                { label: 'Division 1', value: 'Division 1' },
                                { label: 'Division 2', value: 'Division 2' },
                            ]}
                            {...register('division')}
                            errors={errors.division?.message}
                        />

                        <CustomizedSelectInputWithLabel
                            label="Sub Division"
                            list={[
                                { label: 'Select sub division', value: '' },
                                { label: 'SubDivision A', value: 'SubDivision A' },
                                { label: 'SubDivision B', value: 'SubDivision B' },
                            ]}
                            {...register('subDivision')}
                            errors={errors.subDivision?.message}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <CustomizedSelectInputWithLabel
                            label="Section"
                            list={[
                                { label: 'Select section', value: '' },
                                { label: 'Section 1', value: 'Section 1' },
                                { label: 'Section 2', value: 'Section 2' },
                            ]}
                            {...register('section')}
                            errors={errors.section?.message}
                        />

                        <CustomizedInputWithLabel
                            label="Current Incentive %"
                            type="number"
                            {...register('currentPercentage')}
                            error={errors.currentPercentage?.message}
                        />

                        <CustomizedInputWithLabel
                            label="Arrears Incentive %"
                            type="number"
                            {...register('arrearPercentage')}
                            error={errors.arrearPercentage?.message}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-4">
                    <Button variant="outline" type="button" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button variant="destructive" type="button" onClick={handleDelete}>
                        Delete
                    </Button>
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
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

export default EditIncentivePage;
