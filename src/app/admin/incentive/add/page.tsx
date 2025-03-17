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
import { addIncentiveSchema } from '@/lib/zod';
import { getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { getErrorMessage, urlsListWithTitle } from '@/lib/utils';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { ReceiptForPostpaid } from '@/lib/interface';
import { createReceiptForPostpaid } from '@/app/api-calls/admin/api';
import { useSession } from 'next-auth/react';

type FormData = z.infer<typeof addIncentiveSchema>;

const AddCollectorIncentive = () => {
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
        resolver: zodResolver(addIncentiveSchema),
        defaultValues: {
            incentives: [
                {
                    collectorType: '',
                    applicableLevel: null,
                    circle: [],
                    division: [],
                    subDivision: [],
                    section: [],
                    currentPercentage: null,
                    arrearPercentage: null,
                    levelMapWithId: {},
                },
            ],
        },
    });

    const incentives = watch('incentives');

    console.log(incentives)

    const onSubmit = async (data: FormData) => {
        try {
            // for (const receipt of data.receipts) {
            //     let payload: ReceiptForPostpaid = {
            //         discom_id: session?.user?.discomId,
            //         rule_level: data.configRule,
            //         ...data.configRule == 'Levelwise' && {
            //             office_structure_id: receipt.applicableLevel === levelNameMappedWithId.CIRCLE
            //                 ? receipt.circle.map(Number)?.[0]
            //                 : receipt.applicableLevel === levelNameMappedWithId.DIVISION
            //                     ? receipt.division.map(Number)?.[0]
            //                     : receipt.applicableLevel === levelNameMappedWithId.SUB_DIVISION
            //                         ? receipt.subDivision.map(Number)?.[0]
            //                         : receipt.applicableLevel === levelNameMappedWithId.SECTION ? receipt.section.map(Number)?.[0] : null,
            //         },
            //         ...data.configRule == 'Discomwise' && {
            //             office_structure_id: session?.user?.discomId
            //         },
            //         rule_name: "RECEIPT_FOR_POSTPAID",
            //         json_rule: {
            //             receipt_per_month_per_bill: receipt.receiptsPerMonth || 0,
            //             second_receipt_different_payment_mode: receipt.allowSecondReceipt,
            //             receipt_per_day_per_bill: receipt.receiptsPerDay || 0
            //         }
            //     };
            //     const response = await createReceiptForPostpaid(payload);
            //     setIsSubmitting(true);
            //     console.log("API Response:", response);
            //     setIsLoading(true)
            //     router.push(urlsListWithTitle.receiptForPostpaid.url)
            // }
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
        setValue('incentives', [
            ...incentives,
            {
                applicableLevel: null,
                circle: [],
                division: [],
                subDivision: [],
                section: [],
                currentPercentage: null,
                arrearPercentage: null,
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
        setValue(`incentives.${index}.applicableLevel`, value);
        setValue(`incentives.${index}.circle`, []);
        setValue(`incentives.${index}.division`, []);
        setValue(`incentives.${index}.subDivision`, []);
        setValue(`incentives.${index}.section`, []);
        if (value) {
            getPicklistFromList({ id: session?.user?.discomId, type: 'circle', index });
        }
    };

    const handleCircleChange = (index: number, value: number[], levelValue: number) => {
        setValue(`incentives.${index}.circle`, value);
        setValue(`incentives.${index}.division`, []);
        setValue(`incentives.${index}.subDivision`, []);
        setValue(`incentives.${index}.section`, []);
        if (value && levelValue != levelNameMappedWithId.CIRCLE) {
            getPicklistFromList({ id: value, type: 'division', index });
        }
    };

    const handleDivisionChange = (index: number, value: number[], levelValue: number) => {
        setValue(`incentives.${index}.division`, value);
        setValue(`incentives.${index}.subDivision`, []);
        setValue(`incentives.${index}.section`, []);
        if (value && (levelValue == levelNameMappedWithId.SECTION
            || levelValue == levelNameMappedWithId.SUB_DIVISION)) {
            getPicklistFromList({ id: value, type: 'subDivision', index });
        }
    };

    const handleSubDivisionChange = (index: number, value: number[], levelValue: number) => {
        setValue(`incentives.${index}.subDivision`, value);
        setValue(`incentives.${index}.section`, []);
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
            setValue(`incentives.0.levelMapWithId`, levelIdMap);
        })
    }

    return (
        <AuthUserReusableCode pageTitle="Add Incentive" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <div className="">
                    {incentives.map((_, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4 p-4 rounded-lg">
                            <h2 className="col-span-2 text-lg font-semibold">Incentive {index + 1}</h2>
                            <CustomizedSelectInputWithLabel
                                label="Collector Type"
                                containerClass='col-span-2'
                                list={[

                                ]}
                                {...register(`incentives.${index}.collectorType`)}
                                errors={errors?.incentives?.[index]?.collectorType}
                            />
                            <CustomizedSelectInputWithLabel
                                label="Applicable Level"
                                list={listOfApplicableLevel}
                                {...register(`incentives.${index}.applicableLevel`, { valueAsNumber: true })}
                                errors={errors?.incentives?.[index]?.applicableLevel}
                                onChange={(e) => handleLevelChange(index, parseInt(e.target.value))}
                            />
                            {
                                incentives[index].applicableLevel != null && incentives[index].applicableLevel > 0 && <>
                                    <CustomizedMultipleSelectInputWithLabelNumber
                                        label="Circle"
                                        errors={errors?.incentives?.[index]?.circle}
                                        required={true}
                                        list={listOfPicklist[index]?.circle}
                                        placeholder="Select Circle Type"
                                        value={watch(`incentives.${index}.circle`) || []}
                                        // onChange={(selectedValues) => setValue(`incentives.${index}.circle`, selectedValues)}
                                        onChange={(selectedValues) => handleCircleChange(index, selectedValues, incentives[index].applicableLevel)}
                                    />
                                    {incentives[index].applicableLevel != levelNameMappedWithId.CIRCLE && (
                                        <CustomizedMultipleSelectInputWithLabelNumber
                                            label="Division"
                                            required={true}
                                            list={listOfPicklist[index]?.division}
                                            disabled={incentives[index]?.circle?.length == 0}
                                            value={watch(`incentives.${index}.division`) || []}
                                            // onChange={(selectedValues) => setValue(`incentives.${index}.division`, selectedValues)}
                                            onChange={(selectedValues) => handleDivisionChange(index, selectedValues, incentives[index].applicableLevel)}
                                            errors={errors?.incentives?.[index]?.division}
                                        />
                                    )}
                                    {(incentives[index].applicableLevel == levelNameMappedWithId.SECTION
                                        || incentives[index].applicableLevel == levelNameMappedWithId.SUB_DIVISION) && (
                                            <CustomizedMultipleSelectInputWithLabelNumber
                                                label="Sub Division"
                                                required={true}
                                                list={listOfPicklist[index]?.subDivision}
                                                disabled={incentives[index]?.division?.length == 0}
                                                value={watch(`incentives.${index}.subDivision`) || []}
                                                onChange={(selectedValues) => handleSubDivisionChange(index, selectedValues, incentives[index].applicableLevel)}
                                                // onChange={(selectedValues) => setValue(`incentives.${index}.subDivision`, selectedValues)}
                                                errors={errors?.incentives?.[index]?.subDivision}
                                            />
                                        )
                                    }
                                    {
                                        incentives[index].applicableLevel == levelNameMappedWithId.SECTION && (
                                            <CustomizedMultipleSelectInputWithLabelNumber
                                                label="Section"
                                                containerClass='col-span-2'
                                                errors={errors?.incentives?.[index]?.section}
                                                placeholder="Select Section"
                                                list={listOfPicklist[index]?.section}
                                                required={true}
                                                disabled={incentives[index]?.subDivision?.length == 0}
                                                value={watch(`incentives.${index}.section`) || []}

                                                onChange={(selectedValues) => setValue(`incentives.${index}.section`, selectedValues)}
                                            />
                                        )
                                    }
                                </>
                            }

                            <CustomizedMultipleSelectInputWithLabelNumber
                                label="Add Incentive On"
                                required={true}
                                list={[]}
                                value={watch(`incentives.${index}.addIncentiveOn`) || []}
                                onChange={(selectedValues) => setValue(`incentives.${index}.addIncentiveOn`, selectedValues)}
                                errors={errors?.incentives?.[index]?.addIncentiveOn}
                            />

                            <CustomizedInputWithLabel
                                label="Current Amount"
                                type="number"
                                {...register(`incentives.${index}.currentPercentage`, { valueAsNumber: true })}
                                errors={errors?.incentives?.[index]?.currentPercentage}
                            />
                            <CustomizedInputWithLabel
                                label="Arrear Amount"
                                type="number"
                                {...register(`incentives.${index}.arrearPercentage`, { valueAsNumber: true })}
                                errors={errors?.incentives?.[index]?.arrearPercentage}
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-end space-x-4">
                    <Button variant="outline" type="button" onClick={addMoreReceipts}>
                        + Add More
                    </Button>

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

export default AddCollectorIncentive;
