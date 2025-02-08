'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { editAgentAreaFormData, editAgentAreaSchema } from '@/lib/zod';
import { getAgentByPhoneNumber, getLevels, getLevelsDiscomId, updateAgentAreaRole } from '@/app/api-calls/department/api';
import { collectorRolePicklist, getErrorMessage, levelWIthId, testDiscom } from '@/lib/utils';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { toast } from 'sonner';

const EditAgentAreaRoleForm = () => {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<editAgentAreaFormData>({
        resolver: zodResolver(editAgentAreaSchema)
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getWorkingLevel()
    }, [])

    const formData = watch();

    const onSubmit = async (data: editAgentAreaFormData) => {
        if (!showRestFields) {
            return
        }
        try {
            setIsSubmitting(true);
            let payload = {
                "agent_id": data.agentId,
                "collector_role": data.agentRole,
                "working_office_structure": data.workingLevel === levelWIthId.CIRCLE
                    ? data.circle.map(Number)[0]
                    : data.workingLevel === levelWIthId.DIVISION
                        ? data.division.map(Number)[0]
                        : data.workingLevel === levelWIthId.SUB_DIVISION
                            ? data.subDivision.map(Number)[0]
                            : data.workingLevel === levelWIthId.SECTION ? data.section.map(Number)[0] : null,
                "working_level": Number(data.workingLevel)
            }

            const response = await updateAgentAreaRole(payload);
            toast.success("Agency created successfully");
        } catch (error) {
            let errorMessage = getErrorMessage(error);
            toast.error('Error: ' + errorMessage)
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGetAgentData = async () => {
        const mobileNumber = Number(watch('agentMobileNumber'));
        if (!isNaN(mobileNumber) && mobileNumber.toString().length === 10) {
            try {
                setIsLoading(true);
                const response = await getAgentByPhoneNumber(mobileNumber);
                setValue('agentName', response.data.agent_name)
                setValue('agentId', response.data.id)
                setShowRestFields(true)
            } catch (error) {
                let errorMessage = getErrorMessage(error);
                toast.error('Error: ' + errorMessage)
                setShowRestFields(false)
            } finally {
                setIsLoading(false);
            }
        }
    }

    const [workingLevel, setWorkingLevel] = useState([]);

    const [circles, setCircles] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sections, setSections] = useState([]);

    const [showRestFields, setShowRestFields] = useState(false);

    const getCircles = (id) => {
        setIsLoading(true)
        getLevelsDiscomId(id).then((data) => {
            setCircles(
                data?.data?.officeStructure?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.office_description,
                    };
                })
            );
        }).finally(() => { setIsLoading(false); });
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

    const getWorkingLevel = () => {
        getLevels(testDiscom).then((data) => {
            setWorkingLevel(
                data?.data
                    ?.filter((ite) => ite.levelType == "MAIN")
                    ?.map((ite) => {
                        return {
                            value: ite.id,
                            label: ite.levelName,
                        };
                    })
            );
        })
    }

    const handleWorkingLevelChange = (e) => {
        getCircles(testDiscom)
        setValue("circle", []);
        setValue("division", []);
        setValue("subDivision", []);
        setValue("section", []);
    }

    console.log(formData)


    return (
        <AuthUserReusableCode pageTitle="Edit Agent Area & Role" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className='space-y-2'>
                    <div className="col-span-2">
                        <CustomizedInputWithLabel
                            label="Agent Mobile Number"
                            type="text"
                            {...register('agentMobileNumber', { valueAsNumber: true })}
                            onChange={() => {
                                setShowRestFields(false)
                            }}
                            errors={errors.agentMobileNumber}
                        />
                    </div>
                    <div className='text-end'>
                        <Button type="button" onClick={handleGetAgentData} disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Search'}
                        </Button>
                    </div>
                </div>

                {
                    showRestFields &&
                    <div className="grid grid-cols-2 gap-4">
                        <CustomizedInputWithLabel
                            label="Agent Name"
                            disabled
                            errors={errors.agentName}
                            {...register('agentName')}
                        />
                        <CustomizedSelectInputWithLabel
                            label='Agent Role'
                            required
                            list={collectorRolePicklist}
                            {...register('agentRole')}
                            errors={errors.agentRole}
                        />
                        <CustomizedSelectInputWithLabel
                            label="Working Level"
                            errors={errors.workingLevel}
                            containerClass=""
                            required={true}
                            placeholder="Select Working level"
                            list={workingLevel}
                            {...register("workingLevel", { onChange: handleWorkingLevelChange })}
                        />
                        {formData.workingLevel &&
                            <CustomizedMultipleSelectInputWithLabelNumber
                                label="Circle"
                                errors={errors.circle}
                                required={true}
                                list={circles}
                                placeholder="Select Circle Type"
                                value={watch('circle') || []}
                                onChange={(selectedValues) => {
                                    setValue('circle', selectedValues)
                                    if (selectedValues.length > 0 && formData.workingLevel != (levelWIthId.CIRCLE)) {
                                        getDivisions(selectedValues[0]);
                                        setValue('division', [])
                                    }
                                }}
                            />
                        }
                        {formData.workingLevel && formData.workingLevel != levelWIthId.CIRCLE && (
                            <CustomizedMultipleSelectInputWithLabelNumber
                                label="Division"
                                required={true}
                                list={divisions}
                                disabled={formData?.circle?.length == 0}
                                value={watch('division') || []}
                                onChange={(selectedValues) => {
                                    setValue('division', selectedValues)
                                    if (selectedValues.length > 0 && formData.workingLevel != (levelWIthId.DIVISION)) {
                                        getSubDivisions(selectedValues[0]);
                                        setValue('subDivision', [])
                                    }
                                }}
                                errors={errors.division}
                            />
                        )}
                        {
                            formData.workingLevel && (formData.workingLevel == levelWIthId.SECTION
                                || formData.workingLevel == levelWIthId.SUB_DIVISION) && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Sub Division"
                                    errors={errors.subDivision}
                                    placeholder="Select Sub Division"
                                    list={subDivisions}
                                    required={true}
                                    disabled={formData?.division?.length == 0}
                                    value={watch('subDivision') || []}
                                    onChange={(selectedValues) => {
                                        setValue('subDivision', selectedValues)
                                        if (selectedValues.length > 0 && formData.workingLevel == (levelWIthId.SECTION)) {
                                            getSections(selectedValues[0]);
                                            setValue('section', [])
                                        }
                                    }}
                                />
                            )
                        }
                        {
                            formData.workingLevel && formData.workingLevel == levelWIthId.SECTION && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Section"
                                    errors={errors.section}
                                    placeholder="Select Section"
                                    list={sections}
                                    required={true}
                                    disabled={formData?.subDivision?.length == 0}
                                    value={watch('section') || []}
                                    onChange={(selectedValues) => setValue('section', selectedValues)}
                                />
                            )
                        }
                        <div className="flex justify-end col-span-2">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        </div>
                    </div>
                }
            </form>
        </AuthUserReusableCode >
    );
};

export default EditAgentAreaRoleForm;
