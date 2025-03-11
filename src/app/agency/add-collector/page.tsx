'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addCounterCollectorSchema, AddCounterCollectorFormData } from '@/lib/zod';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CustomizedMultipleSelectInputWithLabelString from '@/components/CustomizedMultipleSelectInputWithLabelString';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { getAgencyById, getAllNonEnergyTypes, getAllPaymentModes, getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { createCounterCollector, getCollectorTypes } from '@/app/api-calls/agency/api';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { Loader2 } from 'lucide-react';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { agentWorkingType, collectorRolePicklist, levelWIthId } from '@/lib/utils';
import { useSession } from 'next-auth/react';

const AddCounterCollector = () => {
    const { data: session } = useSession()

    const currentUserId = session?.user?.userId

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<AddCounterCollectorFormData>({
        resolver: zodResolver(addCounterCollectorSchema),
        defaultValues: {
            initialBalance: 0,
            isPersonalNumberSameAsOffice: false
        },
    });

    const [isLoading, setIsLoading] = useState(false);

    const [permissions, setPermissions] = useState([]);
    const [nonEnergyTypes, setNonEnergyTypes] = useState([]);
    const [collectorTypes, setCollectorTypes] = useState([]);
    const [workingLevel, setWorkingLevel] = useState([]);

    const [circles, setCircles] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sections, setSections] = useState([]);

    const [agencyData, setAgencyData] = useState({ working_level: null })

    const [agencyWorkingLevel, setAgencyWorkingLevel] = useState<number>() // maintains the working level of agency
    const [workingLevelActualLists, setWorkingLevelActualLists] = useState([]) //this is total list of working level

    useEffect(() => {
        getWorkingLevel()
        getAgencyData()
        setIsLoading(true)
        getAllPaymentModes().then((data) => {
            setPermissions(
                data?.data
                    ?.filter((ite) => ite.mode_type == "Collection")
                    ?.map((ite) => {
                        return {
                            label: ite.mode_name,
                            value: ite.id,
                        };
                    })
            );
            setIsLoading(false)
        }).catch((err) => { })
        getAllNonEnergyTypes().then((data) => {
            setNonEnergyTypes(
                data?.data?.map((ite) => {
                    return {
                        label: ite.type_name,
                        value: ite.id,
                    };
                })
            );
            setIsLoading(false)
        })
        getCollectorTypes().then((data) => {
            setCollectorTypes(
                data?.data
                    ?.map((ite) => {
                        return {
                            label: ite.name,
                            value: ite.id,
                        };
                    })
            );
            setIsLoading(false)
        })
        setValue('initialBalance', 0);
    }, []);

    const getAgencyData = async () => {
        try {
            const agencyResponse = await getAgencyById(currentUserId);
            const agencyData = agencyResponse.data;
            console.log("agencyData", agencyData);
            setAgencyData(agencyData);

            const levelsResponse = await getLevels(session?.user?.discomId);
            let levels = levelsResponse?.data
                ?.filter((ite) => ite.levelType === "MAIN")
                ?.map((ite) => ({
                    value: ite.id,
                    label: ite.levelName,
                }));

            let levelIdMap = levelsResponse?.data
                ?.filter((item) => item.levelType === "MAIN")
                .reduce((acc, item) => {
                    let levelName = item.levelName.replace(' ', "_");
                    acc[levelName] = item.id;
                    return acc;
                }, {});

            setWorkingLevelActualLists(levels);
            setAgencyWorkingLevel(agencyData?.working_level);

            console.log(agencyData?.working_level)

            const agencyWorkingLevel = agencyData?.working_level;

            console.log(levels)

            handleDisplayWorkingLevel(levels, agencyWorkingLevel)
            const agencyLevel = levels.find((lvl) => lvl.value === agencyWorkingLevel);

            let levelData = agencyData?.working_level_offices.map((ite) => {
                return {
                    value: ite.id,
                    label: ite.office_description,
                };
            })

            console.log(agencyLevel.value, levelData)

            if (agencyLevel.value == levelIdMap.CIRCLE) {
                console.log('setting circle')
                setCircles(levelData)
            } else if (agencyLevel.value == levelIdMap.DIVISION) {
                setDivisions(levelData)
            } else if (agencyLevel.value == levelIdMap.SUB_DIVISION) {
                setSubDivisions(levelData)
            } else if (agencyLevel.value == levelIdMap.SECTION) {
                setSections(levelData)
            }

            // setValue('workingLevel', agencyData?.working_level)

            setPermissions(agencyData?.collection_payment_modes
                ?.map((ite) => {
                    return {
                        label: ite.mode_name,
                        value: ite.id,
                    };
                }))

            setNonEnergyTypes(
                agencyData?.non_energy_types?.map((ite) => {
                    return {
                        label: ite.type_name,
                        value: ite.id,
                    };
                })
            );

        } catch (error) {
            console.error("Error fetching agency data:", error);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: AddCounterCollectorFormData) => {
        setIsSubmitting(true)
        try {
            let payload = {
                "agency_id": currentUserId,
                "agent_name": data.name,
                "primary_phone": data.officePhoneNumber,
                "secondary_phone": data.personalPhoneNumber,
                "maximum_limit": data.maximumLimit,
                "validity_from_date": data.fromValidity,
                "validity_to_date": data.toValidity,
                "collection_payment_modes": data.permission,
                "working_level": data.workingLevel,
                "collection_type_energy": data.collectionType.includes('Energy'),
                "collection_type_non_energy": data.collectionType.includes('Non-Energy'),
                "is_active": true,
                "non_energy_types": data.nonEnergy,
                "working_level_office": data.workingLevel === levelNameMappedWithId.CIRCLE
                    ? data?.circle?.[0]
                    : data.workingLevel === levelNameMappedWithId.DIVISION
                        ? data.division?.[0]
                        : data.workingLevel === levelNameMappedWithId.SUB_DIVISION
                            ? data.subDivision?.[0]
                            : data.workingLevel === levelNameMappedWithId.SECTION ? data.section?.[0] : null,
                "collector_type": parseInt(data.collectorType),
                "work_type": data.workingType,
                "collector_role": data.collectorRole
            }
            await createCounterCollector(payload, currentUserId);
            toast.success('Agent added successfully!');
            reset()
        } catch (error) {
            let errorMessage = error?.data ? error?.data[Object.keys(error?.data)[0]] : error?.error;
            toast.error('Error: ' + errorMessage);
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false)
        }
    };

    const getDivisions = (id) => {
        setIsLoading(true)
        getLevelsDiscomId(id).then((data) => {
            setDivisions(
                data?.data?.officeStructure?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.office_description,
                    };
                })
            );
        }).finally(() => { setIsLoading(false); });
    };

    const getSubDivisions = (id) => {
        setIsLoading(true)
        getLevelsDiscomId(id).then((data) => {
            setSubDivisions(
                data?.data?.officeStructure?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.office_description,
                    };
                })
            );
        }).finally(() => { setIsLoading(false); })
    };

    const getSections = (id) => {
        setIsLoading(true)
        getLevelsDiscomId(id).then((data) => {
            setSections(
                data?.data?.officeStructure?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.office_description,
                    };
                })
            );
        }).finally(() => { setIsLoading(false); });
    };

    const formData = watch()

    const handleDisplayWorkingLevel = (levels, agencyWorkingLevel) => {
        const agencyLevel = levels.find((lvl) => lvl.value === agencyWorkingLevel);

        if (agencyLevel) {
            if (formData.collectorRole === 'Door To Door') {
                levels = levels.filter((lvl) => lvl.value > agencyLevel.value);
            } else {
                levels = levels.filter((lvl) => lvl.value >= agencyLevel.value);
            }
        }

        setWorkingLevel(levels);
    }

    useEffect(() => {
        if (formData.collectorRole) {
            handleDisplayWorkingLevel(workingLevelActualLists, agencyWorkingLevel);
            setValue('workingLevel', null)
            setValue('circle', [])
            setValue('division', [])
            setValue('subDivision', [])
            setValue('section', [])
        }
    }, [formData.collectorRole]);

    useEffect(() => {
        if (formData.workingLevel) {
            handleDisplayWorkingLevel(workingLevelActualLists, agencyWorkingLevel);
            setValue('circle', [])
            setValue('division', [])
            setValue('subDivision', [])
            setValue('section', [])
        }
    }, [formData.workingLevel]);

    const handlePersonalPhoneSameAsOffice = () => {
        console.log(formData)
        if (formData.isPersonalNumberSameAsOffice === false) {
            setValue('isPersonalNumberSameAsOffice', true)
            setValue('personalPhoneNumber', formData.officePhoneNumber)
        } else {
            setValue('isPersonalNumberSameAsOffice', false)
            setValue('personalPhoneNumber', '')
        }
    }

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
        })
    }

    console.log(formData)

    return (
        <AuthUserReusableCode pageTitle="Add Collector" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        containerClass='col-span-2'
                        label="Name"
                        placeholder="Enter Name"
                        required
                        {...register('name')}
                        errors={errors.name}
                    />
                    <CustomizedInputWithLabel
                        label="Office Phone Number"
                        placeholder="Enter Phone Number"
                        required
                        requiredText='(OTP will be sent on this phone number)'
                        {...register('officePhoneNumber')}
                        errors={errors.officePhoneNumber}
                    />
                    <CustomizedInputWithLabel
                        label="Personal Phone Number"
                        placeholder="Enter Phone Number"
                        {...register('personalPhoneNumber')}
                        errors={errors.personalPhoneNumber}
                        additionAction={<div className='flex gap-2 text-end'>
                            <label className='text-themeColor flex-1 text-sm font-medium mt-1'
                            // onClick={handlePersonalPhoneSameAsOffice}
                            >Same as Office Phone Number</label>
                            <input type="checkbox"
                                className='self-center' onClick={handlePersonalPhoneSameAsOffice} />
                        </div>}
                    />
                    <CustomizedInputWithLabel
                        label="Validity Start Date"
                        required
                        type='date'
                        {...register('fromValidity')}
                        errors={errors.fromValidity}
                    />
                    <CustomizedInputWithLabel
                        label="Validity End Date"
                        required
                        type='date'
                        {...register('toValidity')}
                        errors={errors.toValidity}
                    />
                    <CustomizedInputWithLabel
                        label='Maximum Limit'
                        placeholder="Enter Maximum Limit"
                        required
                        {...register('maximumLimit', { valueAsNumber: true })}
                        errors={errors.maximumLimit}
                    />
                    <CustomizedSelectInputWithLabel
                        label='Collector Type'
                        required
                        list={collectorTypes}
                        {...register('collectorType')}
                        errors={errors.collectorType}
                    />
                    <CustomizedSelectInputWithLabel
                        label='Collector Role'
                        required
                        list={collectorRolePicklist}
                        {...register('collectorRole')}
                        // onChange={() => handleDisplayWorkingLevel(workingLevelActualLists, agencyWorkingLevel)}
                        errors={errors.collectorRole}
                    />
                    <CustomizedSelectInputWithLabel
                        label='Working Type'
                        required
                        list={agentWorkingType}
                        {...register('workingType')}
                        errors={errors.workingType}
                    />

                    <CustomizedInputWithLabel
                        label="Initial Balance"
                        type="number"
                        placeholder="Enter Initial Balance"
                        disabled
                        {...register('initialBalance')}
                        errors={errors.initialBalance}
                    />
                    <CustomizedSelectInputWithLabel
                        label='Working Level'
                        required
                        list={workingLevel}
                        {...register('workingLevel', { valueAsNumber: true })}
                        errors={errors.workingLevel}
                    />
                    {
                        formData.workingLevel != null && ((agencyWorkingLevel == levelNameMappedWithId?.CIRCLE) ||
                            (formData.workingLevel == levelNameMappedWithId?.CIRCLE ||
                                formData.workingLevel == levelNameMappedWithId?.DIVISION)) &&
                        <CustomizedMultipleSelectInputWithLabelNumber
                            label="Circle"
                            errors={errors.circle}
                            placeholder="Select Circle"
                            list={circles}
                            required={true}
                            value={watch('circle') || []}
                            // multi={formData.workingLevel === (levelWIthId.CIRCLE)}
                            onChange={(selectedValues) => {
                                setValue('circle', selectedValues)
                                if (selectedValues.length > 0) {
                                    getDivisions(selectedValues[0]);
                                }

                            }}
                        />
                    }
                    {
                        formData.workingLevel != null &&
                        ((agencyWorkingLevel == levelNameMappedWithId?.DIVISION) ||
                            (formData.workingLevel == levelNameMappedWithId?.SUB_DIVISION ||
                                formData.workingLevel == levelNameMappedWithId?.DIVISION)) &&
                        <CustomizedMultipleSelectInputWithLabelNumber
                            label="Division"
                            errors={errors.division}
                            placeholder="Select Division"
                            list={divisions}
                            required={true}
                            value={watch('division') || []}
                            // multi={formData.workingLevel === (levelWIthId.DIVISION)}
                            onChange={(selectedValues) => {
                                setValue('division', selectedValues)
                                if (selectedValues.length > 0) {
                                    getSubDivisions(selectedValues[0]);
                                }

                            }}
                        />
                    }

                    {
                        formData.workingLevel != null
                        && ((agencyWorkingLevel == levelNameMappedWithId?.CIRCLE)
                            || (formData.workingLevel == levelNameMappedWithId?.SECTION
                                || formData.workingLevel == levelNameMappedWithId?.SUB_DIVISION)) && (
                            <CustomizedMultipleSelectInputWithLabelNumber
                                label="Sub Division"
                                errors={errors.subDivision}
                                placeholder="Select Sub Division"
                                list={subDivisions}
                                required={true}
                                value={watch('subDivision') || []}
                                // multi={formData.workingLevel === levelWIthId.SUB_DIVISION}
                                onChange={(selectedValues) => {
                                    setValue('subDivision', selectedValues)
                                    if (selectedValues.length > 0) {
                                        getSections(selectedValues[0]);
                                    }
                                }}
                            />)
                    }
                    {
                        formData.workingLevel == levelNameMappedWithId?.SECTION && (
                            <CustomizedMultipleSelectInputWithLabelNumber
                                label="Section"
                                errors={errors.section}
                                placeholder="Select Section"
                                list={sections}
                                required={true}
                                value={watch('section') || []}
                                // multi={formData.workingLevel === levelWIthId.SECTION}
                                onChange={(selectedValues) => setValue('section', selectedValues)}
                            />)
                    }
                    <CustomizedMultipleSelectInputWithLabelNumber
                        label="Permission"
                        list={permissions}
                        multi={true}
                        required={true}
                        placeholder="Select Permissions"
                        errors={errors.permission}
                        value={watch('permission') || []}
                        onChange={(selectedValues) => setValue('permission', selectedValues)}
                    />
                    <CustomizedMultipleSelectInputWithLabelString
                        label="Collection Type"
                        errors={errors.collectionType}
                        placeholder="Select Collection"
                        list={[
                            { label: "Energy", value: "Energy" },
                            { label: "Non-Energy", value: "Non-Energy" },
                        ]}
                        required={true}
                        value={watch('collectionType') || []}
                        multi={true}
                        onChange={(selectedValues) => setValue('collectionType', selectedValues)}
                    />
                    {watch("collectionType")?.includes("Non-Energy") && (
                        <CustomizedMultipleSelectInputWithLabelNumber
                            label="Non Energy"
                            list={nonEnergyTypes}
                            multi={true}
                            required={true}
                            placeholder="Select Non Energy"
                            errors={errors.nonEnergy}
                            value={watch('nonEnergy') || []}
                            onChange={(selectedValues) => setValue('nonEnergy', selectedValues)}
                        />
                    )}
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default AddCounterCollector;
