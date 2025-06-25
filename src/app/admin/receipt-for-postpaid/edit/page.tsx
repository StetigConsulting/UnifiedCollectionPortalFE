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
import { getErrorMessage } from '@/lib/utils';
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
                    applicableLevel: null,
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
                        office_structure_id: receipt.applicableLevel === levelNameMappedWithId.CIRCLE
                            ? receipt.circle.map(Number)?.[0]
                            : receipt.applicableLevel === levelNameMappedWithId.DIVISION
                                ? receipt.division.map(Number)?.[0]
                                : receipt.applicableLevel === levelNameMappedWithId.SUB_DIVISION
                                    ? receipt.subDivision.map(Number)?.[0]
                                    : receipt.applicableLevel === levelNameMappedWithId.SECTION ? receipt.section.map(Number)?.[0] : null,
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
                router.push('/admin/receipt-for-postpaid')
            }
            toast.success('Number of Receipts Rule Updated Successfully');
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const [levelNameMappedWithId, setLevelNameMappedWithId] = useState<Record<string, number>>({})
    const [listOfApplicableLevel, setListOfApplicableLevel] = useState([])

    useEffect(() => {
        handleGetWorkingLevel()
    }, [])

    const handleGetWorkingLevel = async () => {
        setIsLoading(false)
        await getLevels(session?.user?.discomId).then((res) => {
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
            let levelIdMap = res?.data
                ?.filter((item) => item.levelType === "MAIN")
                .reduce((acc, item) => {
                    let levelName = item.levelName.replace(' ', "_");
                    acc[levelName] = item.id;
                    return acc;
                }, {});
            setLevelNameMappedWithId(levelIdMap)
            setValue(`receipts.0.levelMapWithId`, levelIdMap);
        })
    }

    const [listOfPicklist, setListOfPicklist] = useState([{
        circle: [],
        division: [],
        subDivision: [],
        section: [],
    }]);

    const getPicklistFromList = async ({ id, type = 'circle', index }) => {
        setIsLoading(true);

        await getLevelsDiscomId(id).then((data) => {
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

    const handleLevelChange = async (index: number, value: string) => {
        setValue(`receipts.${index}.applicableLevel`, value);
        setValue(`receipts.${index}.circle`, []);
        setValue(`receipts.${index}.division`, []);
        setValue(`receipts.${index}.subDivision`, []);
        setValue(`receipts.${index}.section`, []);
        if (value) {
            await getPicklistFromList({ id: session?.user?.discomId, type: 'circle', index });
        }
    };

    const handleCircleChange = async (index: number, value: number[], levelValue: number) => {
        setValue(`receipts.${index}.circle`, value);
        setValue(`receipts.${index}.division`, []);
        setValue(`receipts.${index}.subDivision`, []);
        setValue(`receipts.${index}.section`, []);
        if (value && levelValue != levelNameMappedWithId.CIRCLE) {
            await getPicklistFromList({ id: value, type: 'division', index });
        }
    };

    const handleDivisionChange = async (index: number, value: number[], levelValue: number) => {
        setValue(`receipts.${index}.division`, value);
        setValue(`receipts.${index}.subDivision`, []);
        setValue(`receipts.${index}.section`, []);
        if (value && (levelValue == levelNameMappedWithId.SECTION
            || levelValue == levelNameMappedWithId.SUB_DIVISION)) {
            await getPicklistFromList({ id: value, type: 'subDivision', index });
        }
    };

    const handleSubDivisionChange = async (index: number, value: number[], levelValue: number) => {
        setValue(`receipts.${index}.subDivision`, value);
        setValue(`receipts.${index}.section`, []);
        if (value && levelValue == levelNameMappedWithId.SECTION) {
            await getPicklistFromList({ id: value, type: 'section', index });
        }
    };

    const searchParams = useSearchParams();
    const receiptIdFromUrl = searchParams.get('id');

    useEffect(() => {
        if (Object.keys(levelNameMappedWithId).length > 0) {
            getReceiptDetail(receiptIdFromUrl);
        }
    }, [levelNameMappedWithId])

    const getReceiptDetail = async (id: string) => {
        setIsLoading(true)
        try {
            const response = await getReceiptForPostpaidById(id);
            let payload = {
                receiptsPerMonth: response?.data?.json_rule?.receipt_per_month_per_bill,
                receiptsPerDay: response?.data?.json_rule?.receipt_per_day_per_bill,
                allowSecondReceipt: response?.data?.json_rule?.second_receipt_different_payment_mode,
                ...response?.data?.rule_level === 'Levelwise' && {
                    applicableLevel: response?.data?.office_structure?.office_structure_level_id,
                    circle: [],
                    division: [],
                    subDivision: [],
                    section: []
                }
            }

            setValue('configRule', response?.data?.rule_level);
            setValue('receipts', [payload]);
            await setWorkingLevels(response?.data)
        } catch (error) {
            console.error("Failed to get:", error.data[Object.keys(error.data)[0]]);
        } finally {
            setIsLoading(false);
        }
    }

    const setWorkingLevels = async (data) => {
        try {
            setIsLoading(true)
            let workingLevelId = data?.office_structure?.office_structure_level_id;
            let parentOfficeList = data?.parent_office_structure_hierarchy
            await handleLevelChange(0, workingLevelId)
            let circleId = parentOfficeList.filter(item => item?.office_structure_level_id === levelNameMappedWithId.CIRCLE)
            if (circleId.length > 0) {
                await handleCircleChange(0, [circleId[0].id], workingLevelId)
                setIsLoading(true)
                let divisionId = parentOfficeList.filter(item => item?.office_structure_level_id === levelNameMappedWithId.DIVISION)
                if (divisionId.length > 0) {
                    await handleDivisionChange(0, [divisionId[0].id], workingLevelId)
                    setIsLoading(true)
                    let subDivisionId = parentOfficeList.filter(item => item?.office_structure_level_id === levelNameMappedWithId.SUB_DIVISION)
                    if (subDivisionId.length > 0) {
                        await handleSubDivisionChange(0, [subDivisionId[0].id], workingLevelId)
                        setIsLoading(true)
                        setValue(`receipts.0.section`, [data?.office_structure?.id])
                    } else {
                        setValue('receipts.0.subDivision', [data?.office_structure?.id])
                    }
                } else {
                    setValue('receipts.0.division', [data?.office_structure?.id])
                }
            } else {
                setValue('receipts.0.circle', [data?.office_structure?.id])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

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
                                        {...register(`receipts.${index}.applicableLevel`, { valueAsNumber: true })}
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
                                            onChange={(selectedValues) => handleCircleChange(index, selectedValues, receipts[index].applicableLevel)}
                                        />
                                    }
                                    {receipts[index].applicableLevel && receipts[index].applicableLevel != levelNameMappedWithId.CIRCLE && (
                                        <CustomizedMultipleSelectInputWithLabelNumber
                                            label="Division"
                                            required={true}
                                            list={listOfPicklist[index]?.division}
                                            disabled={receipts[index]?.circle?.length == 0}
                                            value={watch(`receipts.${index}.division`) || []}
                                            onChange={(selectedValues) => handleDivisionChange(index, selectedValues, receipts[index].applicableLevel)}
                                            errors={errors?.receipts?.[index]?.division}
                                        />
                                    )}
                                    {receipts[index].applicableLevel && (receipts[index].applicableLevel == levelNameMappedWithId.SECTION
                                        || receipts[index].applicableLevel == levelNameMappedWithId.SUB_DIVISION) && (
                                            <CustomizedMultipleSelectInputWithLabelNumber
                                                label="Sub Division"
                                                required={true}
                                                list={listOfPicklist[index]?.subDivision}
                                                disabled={receipts[index]?.division?.length == 0}
                                                value={watch(`receipts.${index}.subDivision`) || []}
                                                onChange={(selectedValues) => handleSubDivisionChange(index, selectedValues, receipts[index].applicableLevel)}
                                                errors={errors?.receipts?.[index]?.subDivision}
                                            />
                                        )}
                                    {
                                        receipts[index].applicableLevel && receipts[index].applicableLevel == levelNameMappedWithId.SECTION && (
                                            <CustomizedMultipleSelectInputWithLabelNumber
                                                label="Section"
                                                containerClass='col-span-2'
                                                errors={errors?.receipts?.[index]?.section}
                                                placeholder="Select Section"
                                                list={listOfPicklist[index]?.section}
                                                required={true}
                                                disabled={receipts[index]?.subDivision?.length == 0}
                                                value={watch(`receipts.${index}.section`) || []}
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
