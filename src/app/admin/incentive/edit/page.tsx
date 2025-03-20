'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editIncentiveSchema } from '@/lib/zod';
import { Button } from '@/components/ui/button';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { addIncentiveOnKeyValue, addIncentiveOnPicklistValues, getErrorMessage, urlsListWithTitle } from '@/lib/utils';
import { getCollectorTypes } from '@/app/api-calls/agency/api';
import { getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { useSession } from 'next-auth/react';
import { editCollectorIncentive, getInceniveDetailsById } from '@/app/api-calls/admin/api';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import CustomizedMultipleSelectInputWithLabelString from '@/components/CustomizedMultipleSelectInputWithLabelString';
import { CollectorIncentiveInterface, EditCollectorIncentiveInterface } from '@/lib/interface';

type FormData = z.infer<typeof editIncentiveSchema>;

const EditIncentivePage = () => {
    const { data: session } = useSession()
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(editIncentiveSchema),
        defaultValues: {
            addIncentiveOn: []
        }
    });
    const handleSave = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            let current = data;
            let payload: EditCollectorIncentiveInterface = {
                id: idFromUrl,
                incentive_on: current.addIncentiveOn.join(',')
            }
            if (current.addIncentiveOn?.includes(addIncentiveOnKeyValue.arrearAmount)) {
                payload = {
                    ...payload,
                    arrear_amount: current.arrearPercentage,
                }
            }
            if (current.addIncentiveOn[0]?.includes(addIncentiveOnKeyValue.currentAmount)) {
                payload = {
                    ...payload,
                    current_amount: current.currentPercentage,
                }
            }
            const response = await editCollectorIncentive(payload);
            console.log("API Response:", response);
            setIsLoading(true)
            router.push(urlsListWithTitle.incentive.url)
            toast.success('Incentive data saved!');
        } catch (error) {
            console.error('Error saving incentive:', error);
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push(urlsListWithTitle?.incentive.url);
    };

    const [listOfApplicableLevel, setListOfApplicableLevel] = useState([])

    const [collectorTypes, setCollectorTypes] = useState([])

    const searchParams = useSearchParams();
    const idFromUrl = searchParams.get('id');

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
        getIncentiveDetails()
        getPicklistFromList({
            id: session?.user?.discomId,
            type: 'circle'
        })
    }, [])

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
            // setValue(`incentives.0.levelMapWithId`, levelIdMap);
        })
        setIsLoading(false)
    }

    const getIncentiveDetails = async () => {
        try {
            setIsLoading(true)
            const response = await getInceniveDetailsById(idFromUrl);
            console.log(response.data);
            setValue('collectorType', response.data.collector_type.id);
            setValue('applicableLevel', response.data?.office_structure?.office_structure_level_id)
            setValue('addIncentiveOn', response?.data?.incentive_on.split(','))
            setValue('currentPercentage', response.data.current_amount);
            setValue('arrearPercentage', response.data.arrear_amount);
        } catch (error) {
            console.error('Error fetching incentive details:', error);
        } finally {
            setIsLoading(false)
        }
    }

    const [listOfPicklist, setListOfPicklist] = useState({
        circle: [],
        division: [],
        subDivision: [],
        section: [],
    });

    const getPicklistFromList = ({ id, type = 'circle' }) => {
        setIsLoading(true);

        getLevelsDiscomId(id).then((data) => {
            const picklist = data?.data?.officeStructure?.map((ite) => ({
                value: ite.id,
                label: ite.office_description,
            }));

            setListOfPicklist((prevState) => {
                const updatedPicklist = prevState;

                if (type === 'circle') {
                    updatedPicklist.circle = picklist;
                } else if (type === 'division') {
                    updatedPicklist.division = picklist;
                } else if (type === 'subDivision') {
                    updatedPicklist.subDivision = picklist;
                } else if (type === 'section') {
                    updatedPicklist.section = picklist;
                }

                return updatedPicklist;
            });
        }).finally(() => {
            setIsLoading(false);
        });
    };

    const handleLevelChange = (value: number) => {
        setValue(`applicableLevel`, value);
        setValue(`circle`, []);
        setValue(`division`, []);
        setValue(`subDivision`, []);
        setValue(`section`, []);
        if (value) {
            getPicklistFromList({ id: session?.user?.discomId, type: 'circle' });
        }
    };

    const handleCircleChange = (value: number[], levelValue: number) => {
        setValue(`circle`, value);
        setValue(`division`, []);
        setValue(`subDivision`, []);
        setValue(`section`, []);
        if (value && levelValue != levelNameMappedWithId.CIRCLE) {
            getPicklistFromList({ id: value, type: 'division' });
        }
    };

    const handleDivisionChange = (value: number[], levelValue: number) => {
        setValue(`division`, value);
        setValue(`subDivision`, []);
        setValue(`section`, []);
        if (value && (levelValue == levelNameMappedWithId.SECTION
            || levelValue == levelNameMappedWithId.SUB_DIVISION)) {
            getPicklistFromList({ id: value, type: 'subDivision' });
        }
    };

    const handleSubDivisionChange = (value: number[], levelValue: number) => {
        setValue(`subDivision`, value);
        setValue(`section`, []);
        if (value && levelValue == levelNameMappedWithId.SECTION) {
            getPicklistFromList({ id: value, type: 'section' });
        }
    };

    const incentive = watch()

    return (
        <AuthUserReusableCode pageTitle="Edit Incentive" isLoading={isLoading}>
            <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <CustomizedSelectInputWithLabel
                            label="Collector Type"
                            containerClass='col-span-2'
                            list={collectorTypes}
                            {...register(`collectorType`, { valueAsNumber: true })}
                            value={String(watch("collectorType"))}
                            disabled
                            errors={errors?.collectorType}
                        />
                        <CustomizedSelectInputWithLabel
                            label="Applicable Level"
                            list={listOfApplicableLevel}
                            {...register(`applicableLevel`, { valueAsNumber: true })}
                            errors={errors?.applicableLevel}
                            disabled
                            onChange={(e) => handleLevelChange(parseInt(e.target.value))}
                        />

                        {
                            incentive.applicableLevel != null && incentive.applicableLevel > 0 && <>
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Circle"
                                    errors={errors?.circle}

                                    list={listOfPicklist?.circle}
                                    placeholder="Select Circle Type"
                                    value={watch(`circle`) || []}
                                    disabled
                                    onChange={(selectedValues) => handleCircleChange(selectedValues, incentive.applicableLevel)}
                                />
                                {incentive.applicableLevel != levelNameMappedWithId.CIRCLE && (
                                    <CustomizedMultipleSelectInputWithLabelNumber
                                        label="Division"

                                        list={listOfPicklist?.division}
                                        disabled
                                        value={watch(`division`) || []}
                                        // onChange={(selectedValues) => setValue(`incentives.${index}.division`, selectedValues)}
                                        onChange={(selectedValues) => handleDivisionChange(selectedValues, incentive.applicableLevel)}
                                        errors={errors?.division}
                                    />
                                )}
                                {(incentive.applicableLevel == levelNameMappedWithId.SECTION
                                    || incentive.applicableLevel == levelNameMappedWithId.SUB_DIVISION) && (
                                        <CustomizedMultipleSelectInputWithLabelNumber
                                            label="Sub Division"
                                            list={listOfPicklist?.subDivision}
                                            disabled
                                            value={watch(`subDivision`) || []}
                                            onChange={(selectedValues) => handleSubDivisionChange(selectedValues, incentive.applicableLevel)}
                                            // onChange={(selectedValues) => setValue(`incentives.${index}.subDivision`, selectedValues)}
                                            errors={errors?.subDivision}
                                        />
                                    )
                                }
                                {
                                    incentive.applicableLevel == levelNameMappedWithId.SECTION && (
                                        <CustomizedMultipleSelectInputWithLabelNumber
                                            label="Section"
                                            containerClass='col-span-2'
                                            errors={errors?.section}
                                            placeholder="Select Section"
                                            list={listOfPicklist?.section}

                                            disabled
                                            value={watch(`section`) || []}
                                            onChange={(selectedValues) => setValue(`section`, selectedValues)}
                                        />
                                    )
                                }
                            </>
                        }

                        <CustomizedMultipleSelectInputWithLabelString
                            label="Add Incentive On"
                            required={true}
                            multi={true}
                            list={addIncentiveOnPicklistValues}
                            value={watch(`addIncentiveOn`) || []}
                            onChange={(selectedValues) => setValue(`addIncentiveOn`, selectedValues)}
                            errors={errors?.addIncentiveOn}
                        />
                        {
                            incentive?.addIncentiveOn?.includes(addIncentiveOnKeyValue.currentAmount) &&
                            <CustomizedInputWithLabel
                                label="Current Incentive %"
                                type="number"
                                required
                                {...register(`currentPercentage`, { valueAsNumber: true })}
                                errors={errors?.currentPercentage}
                            />
                        }
                        {
                            incentive?.addIncentiveOn?.includes(addIncentiveOnKeyValue.arrearAmount) &&
                            <CustomizedInputWithLabel
                                label="Arrear Incentive %"
                                type="number"
                                required
                                {...register(`arrearPercentage`, { valueAsNumber: true })}
                                errors={errors?.arrearPercentage}
                            />
                        }
                    </div>

                    <div className="flex justify-end space-x-4 mt-4">
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
                </div>
            </form>
        </AuthUserReusableCode >
    );
};

export default EditIncentivePage;
