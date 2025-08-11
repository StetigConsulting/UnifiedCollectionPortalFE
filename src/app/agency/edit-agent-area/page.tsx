'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { editAgentAreaFormData, editAgentAreaSchema, editAgentAreaViaAgencyFormData, editAgentAreaViaAgencySchema } from '@/lib/zod';
import { getAgencyById, getAgentByPhoneNumber, getLevels, getLevelsDiscomId, updateAgentArea, updateAgentAreaRole } from '@/app/api-calls/department/api';
import { collectorRolePicklist, getErrorMessage } from '@/lib/utils';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { toast } from 'sonner';
import AlertPopupWithState from '@/components/Agency/ViewAgency/AlertPopupWithState';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import SuccessErrorModal from '@/components/SuccessErrorModal';

const EditAgentAreaRoleForm = () => {
    const { data: session } = useSession()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        setError,
        reset,
        clearErrors
    } = useForm<editAgentAreaViaAgencyFormData>({
        resolver: zodResolver(editAgentAreaViaAgencySchema)
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [levelIdMapWithLevelName, setLevelIdMapWithLevelName] = useState({
        CIRCLE: null,
        DIVISION: null,
        SUB_DIVISION: null,
        SECTION: null
    })

    const [workingLevel, setWorkingLevel] = useState([]);

    const [circles, setCircles] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sections, setSections] = useState([]);

    const [showRestFields, setShowRestFields] = useState(false);

    const handleWorkingLevelChange = (e) => {
        setValue("circle", []);
        setValue("division", []);
        setValue("subDivision", []);
        setValue("section", []);
    }

    const getCircles = async (id) => {
        setIsLoading(true)
        await getLevelsDiscomId(id).then((data) => {
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

    const getDivisions = async (id) => {
        setIsLoading(true)
        await getLevelsDiscomId(id).then((data) => {
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

    const getSubDivisions = async (id) => {
        setIsLoading(true)
        await getLevelsDiscomId(id).then((data) => {
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

    const getSections = async (id) => {
        setIsLoading(true)
        await getLevelsDiscomId(id).then((data) => {
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

    const formData = watch();

    const onSubmit = async (data: editAgentAreaFormData) => {
        if (!showRestFields) {
            return
        }
        try {
            setIsSubmitting(true);
            let payload = {
                "agent_id": data.agentId,
                "working_office_structure": data.workingLevel === levelIdMapWithLevelName.CIRCLE
                    ? data?.circle?.map(Number)[0]
                    : data?.workingLevel === levelIdMapWithLevelName.DIVISION
                        ? data?.division?.map(Number)[0]
                        : data?.workingLevel === levelIdMapWithLevelName.SUB_DIVISION
                            ? data?.subDivision?.map(Number)[0]
                            : data?.workingLevel === levelIdMapWithLevelName.SECTION ? data?.section?.map(Number)[0] : null,
                "working_level": Number(data?.workingLevel)
            }

            const response = await updateAgentArea(payload);

            toast.success("Agent updated successfully");
            reset()
            window.location.reload();
        } catch (error) {
            let errorMessage = getErrorMessage(error);
            toast.error('Error: ' + errorMessage)
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGetAgentData = async () => {
        const mobileNumber = Number(formData.agentMobileNumber);
        if (!isNaN(mobileNumber) && mobileNumber?.toString()?.length === 10) {
            try {
                setIsLoading(true);
                const response = await getAgentByPhoneNumber(mobileNumber);
                setValue('agentName', response.data.agent_name)
                setValue('agencyName', response.data?.agency?.agency_name)
                setValue('agentId', response.data.id)
                setValue('agentRole', response.data.collector_role)
                setValue('workingLevel', (response.data.working_level))
                await handleSetAllLevelData(response.data)
                await getAgencyData(response?.data?.agency?.id, response?.data?.collector_role)
                setValue('agentRole', response.data.collector_role)
                setShowRestFields(true)
            } catch (error) {
                let errorMessage = getErrorMessage(error);
                toast.error('Error: ' + errorMessage)
                setShowRestFields(false)
            } finally {
                setIsLoading(false);
            }
        } else {
            setError("agentMobileNumber", {
                type: "manual",
                message: "Please enter a valid 10-digit mobile number.",
            });
            return;
        }
    }

    const handleSetAllLevelData = async (data) => {
        try {
            handleWorkingLevelChange('')
            setIsLoading(true)
            let workingLevelOfficeId = data?.working_level_office?.id
            let workingLevelOffices = workingLevelOfficeId ? [workingLevelOfficeId] : []
            let parentOfficeList = data?.parent_office_structure_hierarchy

            let circleId = parentOfficeList.filter(item => item?.office_structure_level_id === levelIdMapWithLevelName.CIRCLE)
            if (circleId.length > 0) {
                setValue('circle', [circleId[0]?.id]);
                setIsLoading(true)
                let divisionId = parentOfficeList.filter(item => item?.office_structure_level_id === levelIdMapWithLevelName.DIVISION)
                await getDivisions(circleId[0]?.id)
                if (divisionId.length > 0) {
                    setValue('division', [divisionId[0].id]);
                    setIsLoading(true)
                    let subDivisionId = parentOfficeList.filter(item => item?.office_structure_level_id === levelIdMapWithLevelName.SUB_DIVISION)
                    await getSubDivisions(divisionId[0].id)
                    if (subDivisionId.length > 0) {
                        setValue('subDivision', [subDivisionId[0].id])
                        setIsLoading(true)
                        await getSections(subDivisionId[0].id)
                        setValue('section', workingLevelOffices)
                    } else {
                        setValue('subDivision', workingLevelOffices)
                    }
                } else {
                    setValue('division', workingLevelOffices)
                }
            } else {
                setValue('circle', workingLevelOffices)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const getWorkingLevel = async () => {
        await getLevels(session?.user?.discomId).then((data) => {
            let levelIdMap = data?.data
                ?.filter((item) => item.levelType === "MAIN")
                .reduce((acc, item) => {
                    let levelName = item.levelName.replace(' ', "_");
                    acc[levelName] = item.id;
                    return acc;
                }, {});

            setLevelIdMapWithLevelName(levelIdMap)
            let levelsList = data?.data
                ?.filter((ite) => ite.levelType == "MAIN")
                ?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.levelName,
                    };
                })
            setWorkingLevel(levelsList);
            setWorkingLevelActualLists(levelsList)
        })
    }

    const [agencyData, setAgencyData] = useState({ working_level: null, working_level_offices: [] })

    const [workingLevelActualLists, setWorkingLevelActualLists] = useState([])

    const getAgencyData = async (id: number, role: string) => {
        try {
            setIsLoading(true)
            const agencyResponse = await getAgencyById(String(id));
            const agencyData = agencyResponse.data;
            setAgencyData({
                working_level: agencyData?.working_level,
                working_level_offices: agencyData?.working_level_offices
            });

            const workingLevel = agencyData?.working_level;

            handleDisplayWorkingLevel(workingLevelActualLists, agencyData?.working_level, role)
            const agencyLevel = workingLevelActualLists.find((lvl) => lvl.value === workingLevel);

            let levelData = agencyData?.working_level_offices.map((ite) => {
                return {
                    value: ite.id,
                    label: ite.office_description,
                };
            })

            if (agencyLevel.value == levelIdMapWithLevelName.CIRCLE) {
                setCircles(levelData)
            } else if (agencyLevel.value == levelIdMapWithLevelName.DIVISION) {
                setDivisions(levelData)
            } else if (agencyLevel.value == levelIdMapWithLevelName.SUB_DIVISION) {
                setSubDivisions(levelData)
            } else if (agencyLevel.value == levelIdMapWithLevelName.SECTION) {
                setSections(levelData)
            }

        } catch (error) {
            console.error("Error fetching agency data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisplayWorkingLevel = (levels, agencyWorkingLevel, role = formData?.agentRole) => {
        const agencyLevel = levels.find((lvl) => lvl.value === agencyWorkingLevel);

        if (agencyLevel) {
            if (role === 'Door To Door') {
                levels = levels.filter((lvl) => lvl.value > agencyLevel.value);
            } else {
                levels = levels.filter((lvl) => lvl.value >= agencyLevel.value);
            }
        }

        setWorkingLevel(levels);
    }

    useEffect(() => {
        getWorkingLevel()
    }, [])

    useEffect(() => {
        if (formData.agentRole) {
            handleDisplayWorkingLevel(workingLevelActualLists, agencyData?.working_level);
        }
    }, [formData.agentRole]);

    const [stateForConfirmationPopup, setStateForConfirmationPopup] = useState(false);

    const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState('')

    return (
        <AuthUserReusableCode pageTitle="Edit Agent Area" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className='space-y-2'>
                    <div className="col-span-2">
                        <CustomizedInputWithLabel
                            label="Agent Mobile Number"
                            type="number"
                            onChange={() => {
                                clearErrors("agentMobileNumber")
                                setValue('agentName', '')
                                setValue('workingLevel', null)
                                setValue('agentRole', '')
                                setShowRestFields(false)
                            }}
                            {...register('agentMobileNumber')}
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
                    // showRestFields &&
                    <div className="grid grid-cols-2 gap-4">
                        <CustomizedInputWithLabel
                            label="Agent Name"
                            disabled
                            errors={errors.agentName}
                            {...register('agentName')}
                        />
                        <CustomizedInputWithLabel
                            label="Agency Name"
                            disabled
                            errors={errors.agencyName}
                            {...register('agencyName')}
                        />
                        <CustomizedSelectInputWithLabel
                            label="Working Level"
                            errors={errors.workingLevel}
                            disabled={!showRestFields}
                            required={true}
                            placeholder="Select Working level"
                            list={workingLevel}
                            {...register("workingLevel", { valueAsNumber: true, onChange: handleWorkingLevelChange })}
                        />
                        {formData.workingLevel != null && !Number.isNaN(formData.workingLevel) && (
                            (agencyData.working_level == levelIdMapWithLevelName?.CIRCLE)) &&
                            <CustomizedMultipleSelectInputWithLabelNumber
                                label="Circle"
                                errors={errors.circle}
                                required={true}
                                list={circles}
                                placeholder="Select Circle Type"
                                value={watch('circle') || []}
                                onChange={(selectedValues) => {
                                    setValue('circle', selectedValues)
                                    if (selectedValues.length > 0 && formData.workingLevel != (levelIdMapWithLevelName.CIRCLE)) {
                                        getDivisions(selectedValues[0]);
                                        setValue('division', [])
                                    }
                                }}
                            />
                        }
                        {formData.workingLevel != null && !Number.isNaN(formData.workingLevel) &&
                            ((agencyData.working_level === levelIdMapWithLevelName?.DIVISION) ||
                                (formData.workingLevel === levelIdMapWithLevelName?.SUB_DIVISION ||
                                    formData.workingLevel === levelIdMapWithLevelName?.DIVISION ||
                                    formData.workingLevel === levelIdMapWithLevelName?.SECTION)) &&
                            (agencyData.working_level !== levelIdMapWithLevelName?.SUB_DIVISION
                                && agencyData.working_level !== levelIdMapWithLevelName?.SECTION) && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Division"
                                    required={true}
                                    list={divisions}
                                    value={watch('division') || []}
                                    onChange={(selectedValues) => {
                                        setValue('division', selectedValues)
                                        if (selectedValues.length > 0 && formData.workingLevel != (levelIdMapWithLevelName.DIVISION)) {
                                            getSubDivisions(selectedValues[0]);
                                            setValue('subDivision', [])
                                        }
                                    }}
                                    errors={errors.division}
                                />
                            )}
                        {
                            formData.workingLevel != null && !Number.isNaN(formData.workingLevel) &&
                            ((agencyData.working_level == levelIdMapWithLevelName?.SUB_DIVISION) ||
                                (formData.workingLevel == levelIdMapWithLevelName?.SECTION
                                    || formData.workingLevel == levelIdMapWithLevelName?.SUB_DIVISION)) &&
                            (agencyData.working_level != levelIdMapWithLevelName?.SECTION) && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Sub Division"
                                    errors={errors.subDivision}
                                    placeholder="Select Sub Division"
                                    list={subDivisions}
                                    required={true}
                                    value={watch('subDivision') || []}
                                    onChange={(selectedValues) => {
                                        setValue('subDivision', selectedValues)
                                        if (selectedValues.length > 0 && formData.workingLevel == (levelIdMapWithLevelName.SECTION)) {
                                            getSections(selectedValues[0]);
                                            setValue('section', [])
                                        }
                                    }}
                                />
                            )
                        }
                        {
                            formData.workingLevel != null && !Number.isNaN(formData.workingLevel) &&
                            formData.workingLevel == levelIdMapWithLevelName.SECTION && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Section"
                                    errors={errors.section}
                                    placeholder="Select Section"
                                    list={sections}
                                    required={true}
                                    value={watch('section') || []}
                                    onChange={(selectedValues) => setValue('section', selectedValues)}
                                />
                            )
                        }
                        <div className="flex justify-end col-span-2">
                            <AlertPopupWithState
                                triggerCode={
                                    <Button
                                        variant="default"
                                        disabled={isSubmitting || !showRestFields}
                                        onClick={handleSubmit((e) => { setStateForConfirmationPopup(true); })}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                            </>
                                        ) : (
                                            "Submit"
                                        )}
                                    </Button>
                                }
                                handleContinue={handleSubmit(onSubmit)}
                                title="Update Agent Area"
                                description="Are you sure you want to update the Agent Working Area?"
                                continueButtonText="Yes"
                                isOpen={stateForConfirmationPopup}
                                setIsOpen={setStateForConfirmationPopup}
                            />
                            {/* <Button type="submit" disabled={isSubmitting || !showRestFields}>
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button> */}
                        </div>
                    </div>
                }
            </form>
            <SuccessErrorModal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}
                message={errorMessage} type="error" />
        </AuthUserReusableCode >
    );
};

export default EditAgentAreaRoleForm;
