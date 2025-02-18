'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { colorCodingBillBasisSchema } from '@/lib/zod';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { createColorCodingBillBasis, getBusinessRuleDateById, updateColorCodingBillBasis } from '@/app/api-calls/admin/api';
import { urlsListWithTitle } from '@/lib/utils';
import { useSession } from 'next-auth/react';

type FormData = z.infer<typeof colorCodingBillBasisSchema>;

const AddBillBasis = () => {
    const { data: session } = useSession()
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [fontType, setFontType] = useState([
        { label: 'Actual Bill', value: 'Actual' },
        { label: 'Provisional Bill', value: 'Provisional' },
        { label: 'Average of 3 Months Bill', value: 'Average of 3 Months' },
    ]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        control,
    } = useForm<FormData>({
        resolver: zodResolver(colorCodingBillBasisSchema),
        defaultValues: {
            fonts: [{ fontType: '', fontColor: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'fonts' });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            let payload = {
                id: null,
                discom_id: session?.user?.discomId,
                office_structure_id: session?.user?.discomId,
                rule_level: "Discomwise",
                rule_name: "BILL_BASIS_COLOR_CODING",
                json_rule: {
                    bill_basis: []
                }
            }

            if (idFromUrl) {
                payload = {
                    ...payload,
                    id: parseInt(idFromUrl),
                }
            }

            let billBasisData = []

            for (const current of data.fonts) {
                let currentData = {
                    bill_type: current.fontType,
                    color_code: current.fontColor
                };
                billBasisData.push(currentData);
            }

            payload = {
                ...payload,
                json_rule: {
                    bill_basis: billBasisData,
                },
            }
            let response: any;
            if (idFromUrl) {
                response = await updateColorCodingBillBasis(payload);
            } else {
                response = await createColorCodingBillBasis(payload);
            }
            console.log('Submitting Data:', response.data);
            toast.success('Color coding rules saved successfully!');
            router.replace(urlsListWithTitle.billBasis.url);
        } catch (error) {
            console.log('Error:', error?.error)
            toast.error('Error: ' + error?.error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackgroundColorChange = (index: number, color: string) => {
        setValue(`fonts.${index}.fontColor`, color);
    };

    const searchParams = useSearchParams();
    const idFromUrl = searchParams.get('id');

    useEffect(() => {
        if (idFromUrl) {
            getLogicDetails(idFromUrl);
        }
    }, [idFromUrl]);

    const getLogicDetails = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await getBusinessRuleDateById(id);
            console.log("API Response:", response.data.json_rule.bill_basis);
            let fetchedData = response.data.json_rule.bill_basis.map((data, index) => {
                return {
                    fontType: data.bill_type,
                    fontColor: data.color_code,
                }
            })
            setValue('fonts', fetchedData);
        } catch (error) {
            console.error("Failed to create agency:", error.data[Object.keys(error.data)[0]]);
        } finally {
            setIsLoading(false);
        }

    }

    return (
        <AuthUserReusableCode pageTitle="Add Bill Basis" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <CustomizedSelectInputWithLabel
                                label="Select Bill Type"
                                list={fontType}
                                {...register(`fonts.${index}.fontType`)}
                                errors={errors.fonts?.[index]?.fontType}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Bill Font Color</label>
                                <div className="flex items-center space-x-2">
                                    <div className="w-full">
                                        <CustomizedInputWithLabel
                                            type="text"
                                            value={watch(`fonts.${index}.fontColor`)}
                                            readOnly
                                            errors={errors.fonts?.[index]?.fontColor}
                                        />
                                    </div>
                                    <input
                                        type="color"
                                        value={watch(`fonts.${index}.fontColor`)}
                                        onChange={(e) => handleBackgroundColorChange(index, e.target.value)}
                                        className="w-10 h-10 border rounded-full cursor-pointer self-start"
                                    />
                                </div>
                            </div>
                        </div>

                        {fields.length > 1 && <div className="mt-2 flex justify-end space-x-2">
                            <Button variant="outline" type="button" onClick={() => remove(index)}>
                                Remove
                            </Button>
                        </div>}
                    </div>
                ))}

                <div className="mt-6 flex justify-end space-x-4">
                    {
                        fields.length < 3 &&
                        <Button variant="outline" type="button" onClick={() => append({ fontType: '', fontColor: '' })}>
                            + Add More
                        </Button>
                    }
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode >
    );
};

export default AddBillBasis;
