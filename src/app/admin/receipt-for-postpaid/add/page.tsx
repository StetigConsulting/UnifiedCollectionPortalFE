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
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { addReceiptsSchema } from '@/lib/zod';
import { getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { getErrorMessage, urlsListWithTitle } from '@/lib/utils';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { ReceiptForPostpaid } from '@/lib/interface';
import { createReceiptForPostpaid } from '@/app/api-calls/admin/api';
import { useSession } from 'next-auth/react';

type FormData = z.infer<typeof addReceiptsSchema>;

const AddReceiptsForPostpaid = () => {
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
        resolver: zodResolver(addReceiptsSchema),
        defaultValues: {
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

    console.log(receipts)

    const onSubmit = async (data: FormData) => {
        try {
            for (const receipt of data.receipts) {
                let payload: ReceiptForPostpaid = {
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
                        office_structure_id: session?.user?.discomId
                    },
                    rule_name: "RECEIPT_FOR_POSTPAID",
                    json_rule: {
                        receipt_per_month_per_bill: receipt.receiptsPerMonth || 0,
                        second_receipt_different_payment_mode: receipt.allowSecondReceipt,
                        receipt_per_day_per_bill: receipt.receiptsPerDay || 0
                    }
                };
                const response = await createReceiptForPostpaid(payload);
                setIsSubmitting(true);
                console.log("API Response:", response);
                setIsLoading(true)
                router.push(urlsListWithTitle.receiptForPostpaid.url)
            }
            toast.success('Number of Receipts Rule added Successfully');
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
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
                applicableLevel: null,
                circle: [],
                division: [],
                subDivision: [],
                section: [],
                receiptsPerMonth: null,
                receiptsPerDay: null,
                allowSecondReceipt: false,
                levelMapWithId: levelNameMappedWithId
            },
        ]);
        let listOfPicklistItems = listOfPicklist
        listOfPicklistItems.push({
            circle: [],
            division: [],
            subDivision: [],
            section: [],
        });

        setListOfPicklist(listOfPicklistItems);
    };

    const [listOfApplicableLevel, setListOfApplicableLevel] = useState([])

    useEffect(() => {
        getWorkingLevel()
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

    const handleLevelChange = (index: number, value: number) => {
        setValue(`receipts.${index}.applicableLevel`, value);
        setValue(`receipts.${index}.circle`, []);
        setValue(`receipts.${index}.division`, []);
        setValue(`receipts.${index}.subDivision`, []);
        setValue(`receipts.${index}.section`, []);
        if (value) {
            getPicklistFromList({ id: session?.user?.discomId, type: 'circle', index });
        }
    };

    const handleCircleChange = (index: number, value: number[], levelValue: number) => {
        setValue(`receipts.${index}.circle`, value);
        setValue(`receipts.${index}.division`, []);
        setValue(`receipts.${index}.subDivision`, []);
        setValue(`receipts.${index}.section`, []);
        if (value && levelValue != levelNameMappedWithId.CIRCLE) {
            getPicklistFromList({ id: value, type: 'division', index });
        }
    };

    const handleDivisionChange = (index: number, value: number[], levelValue: number) => {
        setValue(`receipts.${index}.division`, value);
        setValue(`receipts.${index}.subDivision`, []);
        setValue(`receipts.${index}.section`, []);
        if (value && (levelValue == levelNameMappedWithId.SECTION
            || levelValue == levelNameMappedWithId.SUB_DIVISION)) {
            getPicklistFromList({ id: value, type: 'subDivision', index });
        }
    };

    const handleSubDivisionChange = (index: number, value: number[], levelValue: number) => {
        setValue(`receipts.${index}.subDivision`, value);
        setValue(`receipts.${index}.section`, []);
        if (value && levelValue == levelNameMappedWithId.SECTION) {
            getPicklistFromList({ id: value, type: 'section', index });
        }
    };

    const [levelNameMappedWithId, setLevelNameMappedWithId] = useState<Record<string, number>>({})

    const getWorkingLevel = () => {
        getLevels(session?.user?.discomId).then((data) => {
            let levelIdMap = data?.data
                ?.filter((item) => item.levelType === "MAIN")
                .reduce((acc, item) => {
                    let levelName = item.levelName.replace(' ', "_");
                    acc[levelName] = item.id;
                    return acc;
                }, {});

            console.log(levelIdMap)
            setLevelNameMappedWithId(levelIdMap)
            setValue(`receipts.0.levelMapWithId`, levelIdMap);
        })
    }

    console.log(receipts, configRule, errors)

    return (
        <AuthUserReusableCode pageTitle="Receipts for Postpaid" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <CustomizedSelectInputWithLabel
                    label="Config Rule"
                    list={[
                        { label: 'Levelwise', value: 'Levelwise' },
                        { label: 'Discom Wise', value: 'Discomwise' },
                    ]}
                    {...register('configRule')}
                    errors={errors.configRule}
                />

                {configRule === 'Levelwise' && (
                    <div className="space-y-4">
                        {receipts.map((_, index) => (
                            <div key={index} className="grid grid-cols-2 gap-4 p-4 rounded-lg">
                                <CustomizedSelectInputWithLabel
                                    label="Applicable Level"
                                    list={listOfApplicableLevel}
                                    {...register(`receipts.${index}.applicableLevel`, { valueAsNumber: true })}
                                    errors={errors?.receipts?.[index]?.applicableLevel}
                                    onChange={(e) => handleLevelChange(index, parseInt(e.target.value))}
                                />
                                {
                                    receipts[index].applicableLevel != null && receipts[index].applicableLevel > 0 && <>
                                        <CustomizedMultipleSelectInputWithLabelNumber
                                            label="Circle"
                                            errors={errors?.receipts?.[index]?.circle}
                                            required={true}
                                            list={listOfPicklist[index]?.circle}
                                            placeholder="Select Circle Type"
                                            value={watch(`receipts.${index}.circle`) || []}
                                            // onChange={(selectedValues) => setValue(`receipts.${index}.circle`, selectedValues)}
                                            onChange={(selectedValues) => handleCircleChange(index, selectedValues, receipts[index].applicableLevel)}
                                        />
                                        {receipts[index].applicableLevel != levelNameMappedWithId.CIRCLE && (
                                            <CustomizedMultipleSelectInputWithLabelNumber
                                                label="Division"
                                                required={true}
                                                list={listOfPicklist[index]?.division}
                                                disabled={receipts[index]?.circle?.length == 0}
                                                value={watch(`receipts.${index}.division`) || []}
                                                // onChange={(selectedValues) => setValue(`receipts.${index}.division`, selectedValues)}
                                                onChange={(selectedValues) => handleDivisionChange(index, selectedValues, receipts[index].applicableLevel)}
                                                errors={errors?.receipts?.[index]?.division}
                                            />
                                        )}
                                        {(receipts[index].applicableLevel == levelNameMappedWithId.SECTION
                                            || receipts[index].applicableLevel == levelNameMappedWithId.SUB_DIVISION) && (
                                                <CustomizedMultipleSelectInputWithLabelNumber
                                                    label="Sub Division"
                                                    required={true}
                                                    list={listOfPicklist[index]?.subDivision}
                                                    disabled={receipts[index]?.division?.length == 0}
                                                    value={watch(`receipts.${index}.subDivision`) || []}
                                                    onChange={(selectedValues) => handleSubDivisionChange(index, selectedValues, receipts[index].applicableLevel)}
                                                    // onChange={(selectedValues) => setValue(`receipts.${index}.subDivision`, selectedValues)}
                                                    errors={errors?.receipts?.[index]?.subDivision}
                                                />
                                            )
                                        }
                                        {
                                            receipts[index].applicableLevel == levelNameMappedWithId.SECTION && (
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
                )}

                {configRule === 'Discomwise' && (
                    <div className="space-y-4">
                        {/* DiscomWise form fields */}
                        {receipts.map((_, index) => (
                            <div key={index} className="grid grid-cols-2 gap-4 p-4 rounded-lg">
                                <CustomizedInputWithLabel
                                    label="Number of Receipts Possbile Per Month Per Consumer"
                                    type="number"
                                    {...register(`receipts.${index}.receiptsPerMonth`, { valueAsNumber: true })}
                                    errors={errors?.receipts?.[index]?.receiptsPerMonth}
                                />
                                <CustomizedInputWithLabel
                                    label="Number of Receipts Possbile Per Day Per Consumer"
                                    type="number"
                                    {...register(`receipts.${index}.receiptsPerDay`, { valueAsNumber: true })}
                                    errors={errors?.receipts?.[index]?.receiptsPerDay}
                                />
                                <div className="flex items-center space-x-2 col-span-2">
                                    <input type="checkbox"
                                        {...register(`receipts.${index}.allowSecondReceipt`)}
                                        disabled={watch(`receipts.${index}.receiptsPerDay`) != 1} />
                                    <label>Second receipt is allowed with different payment mode</label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 text-end space-x-4">
                    {configRule !== 'Discomwise' && configRule &&
                        <Button variant="outline" type="button" onClick={addMoreReceipts}>
                            + Add More
                        </Button>
                    }
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

export default AddReceiptsForPostpaid;
