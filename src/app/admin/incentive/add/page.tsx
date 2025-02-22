'use client';

import React, { useState } from 'react';
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

const AddIncentivePage = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(addIncentiveSchema),
    });

    const [incentiveData, setIncentiveData] = useState([
        {
            applicableLevel: '',
            circle: '',
            division: '',
            subDivision: '',
            section: '',
            currentPercentage: '',
            arrearPercentage: '',
        }
    ]);

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
        const updatedData = [...incentiveData];
        updatedData[index][field] = e.target.value;
        setIncentiveData(updatedData);
    };

    const handleAddIncentive = () => {
        setIncentiveData([
            ...incentiveData,
            {
                applicableLevel: '',
                circle: '',
                division: '',
                subDivision: '',
                section: '',
                currentPercentage: '',
                arrearPercentage: '',
            }
        ]);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            // Replace with actual API call
            await fetch('/api/save-incentive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(incentiveData),
            });
            toast.success('Incentive data saved!');
        } catch (error) {
            console.error('Error saving incentive:', error);
            toast.error('Failed to save incentive.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <AuthUserReusableCode pageTitle="Add Incentive">
            <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
                {incentiveData.map((incentive, index) => (
                    <div key={index} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <CustomizedSelectInputWithLabel
                                label="Applicable Level"
                                list={[]}
                                value={incentive.applicableLevel}
                                onChange={(e) => handleChange(index, e, 'applicableLevel')}
                                errors={errors.applicableLevel?.message}
                            />

                            <CustomizedSelectInputWithLabel
                                label="Circle"
                                list={[]}
                                value={incentive.circle}
                                onChange={(e) => handleChange(index, e, 'circle')}
                                errors={errors.circle?.message}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <CustomizedSelectInputWithLabel
                                label="Division"
                                list={[]}
                                value={incentive.division}
                                onChange={(e) => handleChange(index, e, 'division')}
                                errors={errors.division?.message}
                            />

                            <CustomizedSelectInputWithLabel
                                label="Sub Division"
                                list={[]}
                                value={incentive.subDivision}
                                onChange={(e) => handleChange(index, e, 'subDivision')}
                                errors={errors.subDivision?.message}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <CustomizedSelectInputWithLabel
                                label="Section"
                                list={[]}
                                value={incentive.section}
                                onChange={(e) => handleChange(index, e, 'section')}
                                errors={errors.section?.message}
                            />

                            <CustomizedInputWithLabel
                                label="Current %"
                                type="number"
                                value={incentive.currentPercentage}
                                onChange={(e) => handleChange(index, e, 'currentPercentage')}
                                error={errors.currentPercentage?.message}
                            />

                            <CustomizedInputWithLabel
                                label="Arrears %"
                                type="number"
                                value={incentive.arrearPercentage}
                                onChange={(e) => handleChange(index, e, 'arrearPercentage')}
                                error={errors.arrearPercentage?.message}
                            />
                        </div>
                    </div>
                ))}

                <div className="mt-6 text-end space-x-4">
                    <Button variant="outline" onClick={handleAddIncentive}>
                        + Add More Incentive
                    </Button>
                    <Button variant="outline" type="button" onClick={handleCancel} className="mr-2">
                        Cancel
                    </Button>
                    <Button variant="default" type="submit" disabled={isSubmitting}>
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

export default AddIncentivePage;
