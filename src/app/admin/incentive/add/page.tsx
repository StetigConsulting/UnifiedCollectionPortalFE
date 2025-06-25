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
import { addIncentiveOnKeyValue, addIncentiveOnPicklistValues, getErrorMessage, urlsListWithTitle } from '@/lib/utils';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { CollectorIncentiveInterface, ReceiptForPostpaid } from '@/lib/interface';
import { addCollectorIncentive, createReceiptForPostpaid } from '@/app/api-calls/admin/api';
import { useSession } from 'next-auth/react';
import { getCollectorTypes } from '@/app/api-calls/agency/api';
import CustomizedMultipleSelectInputWithLabelString from '@/components/CustomizedMultipleSelectInputWithLabelString';

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
                    collectorType: null,
                    applicableLevel: null,
                    circle: [],
                    division: [],
                    subDivision: [],
                    section: [],
                    currentPercentage: null,
                    arrearPercentage: null,
                    levelMapWithId: {},
                    addIncentiveOn: []
                },
            ],
        },
    });

    const incentives = watch('incentives');

    const onSubmit = async (data: FormData) => {
        try {
            setIsSubmitting(true);
            let current = data.incentives[0];
            let payload: CollectorIncentiveInterface = {
                discom_id: session?.user?.discomId,
                office_structure_id: current.applicableLevel === levelNameMappedWithId.CIRCLE
                    ? current.circle[0]
                    : current.applicableLevel === levelNameMappedWithId.DIVISION
                        ? current.division[0]
                        : current.applicableLevel === levelNameMappedWithId.SUB_DIVISION
                            ? current.subDivision[0]
                            : current.applicableLevel === levelNameMappedWithId.SECTION ? current.section[0] : null,
                collector_type_id: current.collectorType,
                incentive_on: current.addIncentiveOn.sort((a, b) => b.localeCompare(a)).join(',')
            }
            if (current.addIncentiveOn.includes(addIncentiveOnKeyValue.arrearAmount)) {
                payload = {
                    ...payload,
                    arrear_amount: current.arrearPercentage,
                }
            }
            if (current.addIncentiveOn.includes(addIncentiveOnKeyValue.currentAmount)) {
                payload = {
                    ...payload,
                    current_amount: current.currentPercentage,
                }
            }
            const response = await addCollectorIncentive(payload);
            setIsLoading(true)
            router.push(urlsListWithTitle.incentive.url)
            toast.success('Collector incentive added Successfully');
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

    const [collectorTypes, setCollectorTypes] = useState([])

    useEffect(() => {
        getCollectorTypes().then((res) => {
            setIsLoading(true)
            setCollectorTypes(
                res?.data
                    ?.map((ite) => {
                        return {
                            label: ite.name,
                            value: ite.id,
                        };
                    })
            );
            setIsLoading(false)
        }).catch((error) => { })
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
        getWorkingLevel()
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

    const getWorkingLevel = async () => {
        setIsLoading(true)
        await getLevels(session?.user?.discomId).then((data) => {
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
        setIsLoading(false)
    }

    console.log(errors)

    return (
        <AuthUserReusableCode pageTitle="Add Incentive" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <div className="">
                    {incentives.map((_, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4 p-4 rounded-lg">
                            {/* <h2 className="col-span-2 text-lg font-semibold">Incentive {index + 1}</h2> */}
                            <CustomizedSelectInputWithLabel
                                label="Collector Type"
                                containerClass='col-span-2'
                                list={collectorTypes}
                                {...register(`incentives.${index}.collectorType`, { valueAsNumber: true })}
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

                            <CustomizedMultipleSelectInputWithLabelString
                                label="Add Incentive On"
                                required={true}
                                list={addIncentiveOnPicklistValues}
                                multi={true}
                                value={watch(`incentives.${index}.addIncentiveOn`) || []}
                                onChange={(selectedValues) => setValue(`incentives.${index}.addIncentiveOn`, selectedValues)}
                                errors={errors?.incentives?.[index]?.addIncentiveOn}
                            />
                            {
                                incentives[0]?.addIncentiveOn?.includes(addIncentiveOnKeyValue.currentAmount) &&
                                <CustomizedInputWithLabel
                                    label="Current Incentive %"
                                    type="number"
                                    {...register(`incentives.${index}.currentPercentage`, { valueAsNumber: true })}
                                    errors={errors?.incentives?.[index]?.currentPercentage}
                                />
                            }

                            {
                                incentives[0]?.addIncentiveOn?.includes(addIncentiveOnKeyValue.arrearAmount) &&
                                <CustomizedInputWithLabel
                                    label="Arrear Incentive %"
                                    type="number"
                                    {...register(`incentives.${index}.arrearPercentage`, { valueAsNumber: true })}
                                    errors={errors?.incentives?.[index]?.arrearPercentage}
                                />
                            }
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-end space-x-4">
                    {/* <Button variant="outline" type="button" onClick={addMoreReceipts}>
                        + Add More
                    </Button> */}

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
