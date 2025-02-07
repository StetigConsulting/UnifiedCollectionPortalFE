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
import { colorCodingLogicSchema } from '@/lib/zod';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { createColorCodingLogic, getBusinessRuleDateById, updateColorCodingLogic } from '@/app/api-calls/admin/api';
import { testDiscom } from '@/lib/utils';
import moment from 'moment';

type FormData = z.infer<typeof colorCodingLogicSchema>;

const AddColorCodingLogic = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [valueTypePicklist, setValueTypePicklist] = useState([
        { label: 'Date', value: 'DATE' },
        { label: 'Days', value: 'DAYS' },
    ]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        control,
    } = useForm<FormData>({
        resolver: zodResolver(colorCodingLogicSchema),
        defaultValues: {
            colorCodings: [
                {
                    value1Type: '',
                    value1: '',
                    value2Type: '',
                    value2: '',
                    colorCode: '',
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'colorCodings' });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            let payload = {
                id: null,
                discom_id: parseInt(testDiscom),
                office_structure_id: parseInt(testDiscom),
                rule_level: "Discomwise",
                rule_name: "PAYMENT_STATUS_COLOR_CODING",
                json_rule: {
                    ranges: [],
                },
            };

            if (idFromUrl) {
                payload = {
                    ...payload,
                    id: parseInt(idFromUrl),
                }
            }

            let rangeData = [];
            for (const current of data.colorCodings) {
                let currentData = {
                    R1: {
                        type: current.value1Type,
                        value: current.value1Type === 'DATE' ? moment(current.value1).format('DD-MM-YYYY') : current.value1,
                    },
                    R2: {
                        type: current.value2Type,
                        value: current.value2Type === 'DATE' ? moment(current.value2).format('DD-MM-YYYY') : current.value2,
                    },
                    order: rangeData.length + 1,
                    color_code: current.colorCode,
                };
                rangeData.push(currentData);
            }

            payload = {
                ...payload,
                json_rule: {
                    ranges: rangeData,
                },
            };

            let response: any;
            if (idFromUrl) {
                response = await updateColorCodingLogic(payload);
            } else {
                response = await createColorCodingLogic(payload);
            }
            console.log('Submitting Data:', response.data);
            toast.success('Color coding rules saved successfully!');
            router.push('/admin/color-coding');
        } catch (error) {
            console.log('Error:', error?.error)
            toast.error('Error: ' + error?.error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackgroundColorChange = (index: number, color: string) => {
        setValue(`colorCodings.${index}.colorCode`, color);
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
            console.log("API Response:", response.data.json_rule.ranges);
            let fetchedData = response.data.json_rule.ranges.map((data, index) => {
                return {
                    value1Type: data.R1.type,
                    value1: data.R1.type === 'DATE' ? moment(data.R1.value).format('YYYY-MM-DD') : data.R1.value,
                    value2Type: data.R2.type,
                    value2: data.R2.type === 'DATE' ? moment(data.R2.value).format('YYYY-MM-DD') : data.R2.value,
                    colorCode: data.color_code,
                }
            })
            setValue('colorCodings', fetchedData);
        } catch (error) {
            console.error("Failed to create agency:", error.data[Object.keys(error.data)[0]]);
        } finally {
            setIsLoading(false);
        }

    }

    return (
        <AuthUserReusableCode pageTitle={idFromUrl ? 'Edit Color Coding Logic' : "Add Color Coding Logic"} isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">Last Payment Date Logic {index + 1}</h2>
                        <p className="text-gray-600 mb-4 bg-lightThemeColor py-2 px-4 rounded-md">[ {watch(`colorCodings.${index}.value1`)} {watch(`colorCodings.${index}.value1Type`)} ]
                            &lt; Last Payment Date &lt; [  {watch(`colorCodings.${index}.value2`)} {watch(`colorCodings.${index}.value2Type`)}]
                            - Color Code &nbsp;<span style={{ backgroundColor: watch('colorCodings.0.colorCode'), borderRadius: '4px', padding: '4px 12px' }}>
                            </span></p>
                        <div className="grid grid-cols-2 gap-4">
                            <CustomizedSelectInputWithLabel
                                label="Value 1 Type"
                                list={valueTypePicklist}
                                {...register(`colorCodings.${index}.value1Type`)}
                                errors={errors.colorCodings?.[index]?.value1Type}
                            />
                            {watch(`colorCodings.${index}.value1Type`) === 'DAYS' ? (
                                <CustomizedInputWithLabel
                                    label="Days"
                                    type="number"
                                    {...register(`colorCodings.${index}.value1`)}
                                    errors={errors.colorCodings?.[index]?.value1}
                                />
                            ) : (
                                <CustomizedInputWithLabel
                                    label="Date"
                                    type="date"
                                    {...register(`colorCodings.${index}.value1`)}
                                    errors={errors.colorCodings?.[index]?.value1}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <CustomizedSelectInputWithLabel
                                label="Value 2 Type"
                                list={valueTypePicklist}
                                {...register(`colorCodings.${index}.value2Type`)}
                                errors={errors.colorCodings?.[index]?.value2Type}
                            />
                            {watch(`colorCodings.${index}.value2Type`) === 'DAYS' ? (
                                <CustomizedInputWithLabel
                                    label="Days"
                                    type="number"
                                    {...register(`colorCodings.${index}.value2`)}
                                    errors={errors.colorCodings?.[index]?.value2}
                                />
                            ) : (
                                <CustomizedInputWithLabel
                                    label="Date"
                                    type="date"
                                    {...register(`colorCodings.${index}.value2`)}
                                    errors={errors.colorCodings?.[index]?.value2}
                                />
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Select Background Color</label>
                            <div className="flex items-center space-x-2">
                                <div className="w-full">
                                    <CustomizedInputWithLabel
                                        type="text"
                                        value={watch(`colorCodings.${index}.colorCode`)}
                                        readOnly
                                        errors={errors.colorCodings?.[index]?.colorCode}
                                    />
                                </div>
                                <input
                                    type="color"
                                    value={watch(`colorCodings.${index}.colorCode`)}
                                    onChange={(e) => handleBackgroundColorChange(index, e.target.value)}
                                    className="w-10 h-10 border rounded-full cursor-pointer self-start"
                                />
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
                    <Button variant="outline" type="button" onClick={() => append({ value1Type: '', value1: '', value2Type: '', value2: '', colorCode: '' })}>
                        + Add More
                    </Button>
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

export default AddColorCodingLogic;
