'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { editReceiptsSchema } from '@/lib/zod';
import { getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { getErrorMessage, levelWIthId } from '@/lib/utils';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { ReceiptForPostpaid } from '@/lib/interface';
import { editReceiptForPostpaid, getReceiptForPostpaidById } from '@/app/api-calls/admin/api';
import { useSession } from 'next-auth/react';

type FormData = z.infer<typeof editReceiptsSchema>;

const EditReceiptsForPostpaid = () => {
    const { data: session } = useSession()
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(editReceiptsSchema),
        defaultValues: {
            configRule: 'Levelwise',
            receipts: [
                {
                    applicableLevel: '',
                    circle: [],
                    division: [],
                    subDivision: [],
                    section: [],
                    receiptsPerMonth: null,
                    receiptsPerDay: null,
                    allowSecondReceipt: false,
                },
            ],
        },
    });

    const receipts = watch('receipts');
    const configRule = watch('configRule');

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        try {
            for (const receipt of data.receipts) {
                let payload: ReceiptForPostpaid = {
                    id: parseInt(receiptIdFromUrl),
                    discom_id: session?.user?.discomId,
                    rule_level: data.configRule,
                    ...data.configRule == 'Levelwise' && {
                        office_structure_id: receipt.applicableLevel === levelWIthId.CIRCLE
                            ? receipt.circle.map(Number)?.[0]
                            : receipt.applicableLevel === levelWIthId.DIVISION
                                ? receipt.division.map(Number)?.[0]
                                : receipt.applicableLevel === levelWIthId.SUB_DIVISION
                                    ? receipt.subDivision.map(Number)?.[0]
                                    : receipt.applicableLevel === levelWIthId.SECTION ? receipt.section.map(Number)?.[0] : null,
                    },
                    ...data.configRule == 'Discomwise' && {
                        office_structure_id: session?.user?.discomId,
                    },
                    rule_name: "RECEIPT_FOR_POSTPAID",
                    json_rule: {
                        receipt_per_month_per_bill: receipt.receiptsPerMonth || 0,
                        second_receipt_different_payment_mode: receipt.allowSecondReceipt,
                        receipt_per_day_per_bill: receipt.receiptsPerDay || 0
                    }
                };
                const response = await editReceiptForPostpaid(payload);
                setIsSubmitting(true);
                console.log("API Response:", response);
                setIsLoading(true)
                router.push('/admin/receipt-for-postpaid')
            }
            toast.success('Number of Receipts Rule Updated Successfully');
        } catch (error) {
            console.log(error)
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const [listOfApplicableLevel, setListOfApplicableLevel] = useState([])

    useEffect(() => {
        getLevels(session?.user?.discomId).then((res) => {
            setListOfApplicableLevel(
                res?.data
                    ?.filter((ite) => ite.levelType == "MAIN")
                    ?.map((ite) => {
                        return {
                            value: ite.id,
                            label: ite.levelName,
                        };
                    })
            );
        })
    }, [])

    const [listOfPicklist, setListOfPicklist] = useState([{
        circle: [],
        division: [],
        subDivision: [],
        section: [],
    }]);

    const getPicklistFromList = ({ id, type = 'circle', index }) => {
        setIsLoading(true);

        getLevelsDiscomId(id).then((data) => {
            const picklist = data?.data?.officeStructure?.map((ite) => ({
                value: ite.id,
                label: ite.office_description,
            }));

            setListOfPicklist((prevState) => {
                const updatedPicklist = prevState;

                if (type === 'circle') {
                    updatedPicklist[index].circle = picklist;
                } else if (type === 'division') {
                    updatedPicklist[index].division = picklist;
                } else if (type === 'subDivision') {
                    updatedPicklist[index].subDivision = picklist;
                } else if (type === 'section') {
                    updatedPicklist[index].section = picklist;
                }

                return updatedPicklist;
            });
        }).finally(() => {
            setIsLoading(false);
        });
    };

    const handleLevelChange = (index: number, value: string) => {
        setValue(`receipts.${index}.applicableLevel`, value);
        setValue(`receipts.${index}.circle`, []);
        setValue(`receipts.${index}.division`, []);
        setValue(`receipts.${index}.subDivision`, []);
        setValue(`receipts.${index}.section`, []);
        if (value) {
            getPicklistFromList({ id: session?.user?.discomId, type: 'circle', index });
        }
    };

    const handleCircleChange = (index: number, value: number[], levelValue: string) => {
        setValue(`receipts.${index}.circle`, value);
        setValue(`receipts.${index}.division`, []);
        setValue(`receipts.${index}.subDivision`, []);
        setValue(`receipts.${index}.section`, []);
        if (value && levelValue != levelWIthId.CIRCLE) {
            getPicklistFromList({ id: value, type: 'division', index });
        }
    };

    const handleDivisionChange = (index: number, value: number[], levelValue: string) => {
        setValue(`receipts.${index}.division`, value);
        setValue(`receipts.${index}.subDivision`, []);
        setValue(`receipts.${index}.section`, []);
        if (value && (levelValue == levelWIthId.SECTION
            || levelValue == levelWIthId.SUB_DIVISION)) {
            getPicklistFromList({ id: value, type: 'subDivision', index });
        }
    };

    const handleSubDivisionChange = (index: number, value: number[], levelValue: string) => {
        setValue(`receipts.${index}.subDivision`, value);
        setValue(`receipts.${index}.section`, []);
        if (value && levelValue == levelWIthId.SECTION) {
            getPicklistFromList({ id: value, type: 'section', index });
        }
    };

    const searchParams = useSearchParams();
    const receiptIdFromUrl = searchParams.get('id');

    useEffect(() => {
        if (receiptIdFromUrl) {
            getReceiptDetail(receiptIdFromUrl);
        }
    }, [receiptIdFromUrl])

    const getReceiptDetail = async (id: string) => {
        setIsLoading(true)
        try {
            const response = await getReceiptForPostpaidById(id);
            console.log("API Response:", response);
            let payload = {
                ...receipts[0],
                receiptsPerMonth: response?.data?.json_rule?.receipt_per_month_per_bill,
                receiptsPerDay: response?.data?.json_rule?.receipt_per_day_per_bill,
                allowSecondReceipt: response?.data?.json_rule?.second_receipt_different_payment_mode,
            }
            setValue('configRule', response?.data?.rule_level);
            setValue('receipts', [payload]);
        } catch (error) {
            console.error("Failed to get:", error.data[Object.keys(error.data)[0]]);
        } finally {
            setIsLoading(false);
        }
    }

    console.log(errors)

    return (
        <AuthUserReusableCode pageTitle="Receipts for Postpaid" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                    {receipts.map((_, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4 p-4 rounded-lg">
                            {configRule === 'Levelwise' &&
                                <>
                                    <CustomizedSelectInputWithLabel
                                        label="Applicable Level"
                                        list={listOfApplicableLevel}
                                        {...register(`receipts.${index}.applicableLevel`)}
                                        errors={errors?.receipts?.[index]?.applicableLevel}
                                        onChange={(e) => handleLevelChange(index, e.target.value)}
                                    />
                                    {receipts[index].applicableLevel &&
                                        <CustomizedMultipleSelectInputWithLabelNumber
                                            label="Circle"
                                            errors={errors?.receipts?.[index]?.circle}
                                            required={true}
                                            list={listOfPicklist[index]?.circle}
                                            placeholder="Select Circle Type"
                                            value={watch(`receipts.${index}.circle`) || []}
                                            // onChange={(selectedValues) => setValue(`receipts.${index}.circle`, selectedValues)}
                                            onChange={(selectedValues) => handleCircleChange(index, selectedValues, receipts[index].applicableLevel)}
                                        // multi={receipts[index].applicableLevel == levelWIthId.CIRCLE}
                                        />
                                    }
                                    {receipts[index].applicableLevel && receipts[index].applicableLevel != levelWIthId.CIRCLE && (
                                        <CustomizedMultipleSelectInputWithLabelNumber
                                            label="Division"
                                            required={true}
                                            list={listOfPicklist[index]?.division}
                                            disabled={receipts[index]?.circle?.length == 0}
                                            value={watch(`receipts.${index}.division`) || []}
                                            // onChange={(selectedValues) => setValue(`receipts.${index}.division`, selectedValues)}
                                            onChange={(selectedValues) => handleDivisionChange(index, selectedValues, receipts[index].applicableLevel)}
                                            // multi={receipts[index].applicableLevel == levelWIthId.DIVISION}
                                            errors={errors?.receipts?.[index]?.division}
                                        />
                                    )}
                                    {receipts[index].applicableLevel && (receipts[index].applicableLevel == levelWIthId.SECTION
                                        || receipts[index].applicableLevel == levelWIthId.SUB_DIVISION) && (
                                            <CustomizedMultipleSelectInputWithLabelNumber
                                                label="Sub Division"
                                                required={true}
                                                list={listOfPicklist[index]?.subDivision}
                                                disabled={receipts[index]?.division?.length == 0}
                                                value={watch(`receipts.${index}.subDivision`) || []}
                                                onChange={(selectedValues) => handleSubDivisionChange(index, selectedValues, receipts[index].applicableLevel)}
                                                // onChange={(selectedValues) => setValue(`receipts.${index}.subDivision`, selectedValues)}
                                                // multi={receipts[index].applicableLevel == levelWIthId.DIVISION}
                                                errors={errors?.receipts?.[index]?.subDivision}
                                            />
                                        )}
                                    {
                                        receipts[index].applicableLevel && receipts[index].applicableLevel == levelWIthId.SECTION && (
                                            <CustomizedMultipleSelectInputWithLabelNumber
                                                label="Section"
                                                containerClass='col-span-2'
                                                errors={errors?.receipts?.[index]?.section}
                                                placeholder="Select Section"
                                                list={listOfPicklist[index]?.section}
                                                required={true}
                                                disabled={receipts[index]?.subDivision?.length == 0}
                                                value={watch(`receipts.${index}.section`) || []}
                                                // multi={receipts[index]?.applicableLevel == levelWIthId.SECTION}
                                                onChange={(selectedValues) => setValue(`receipts.${index}.section`, selectedValues)}
                                            />
                                        )
                                    }
                                </>
                            }
                            <CustomizedInputWithLabel
                                label="Receipts per month against one bill"
                                type="number"
                                {...register(`receipts.${index}.receiptsPerMonth`, { valueAsNumber: true })}
                                errors={errors?.receipts?.[index]?.receiptsPerMonth}
                            />
                            <CustomizedInputWithLabel
                                label="Receipts per day against one bill"
                                type="number"
                                {...register(`receipts.${index}.receiptsPerDay`, { valueAsNumber: true })}
                                errors={errors?.receipts?.[index]?.receiptsPerDay}
                            />
                            <div className="col-span-2 flex items-center space-x-2">
                                <input type="checkbox"
                                    {...register(`receipts.${index}.allowSecondReceipt`)}
                                    disabled={watch(`receipts.${index}.receiptsPerDay`) != 1} />
                                <label>Second receipt is allowed with different payment mode</label>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-end space-x-4">
                    <Button variant="outline" type="button" onClick={handleCancel}>
                        Cancel
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

export default EditReceiptsForPostpaid;
