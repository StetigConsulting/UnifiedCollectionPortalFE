"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editAgencyAreaSchema, EditAgencyAreaFormData } from "@/lib/zod";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { editAgencyAreaById, getAgenciesWithDiscom, getAgencyById, getLevels, getLevelsDiscomId } from "@/app/api-calls/department/api";
import CustomizedMultipleSelectInputWithLabelNumber from "@/components/CustomizedMultipleSelectInputWithLabelNumber";
import { Loader2 } from "lucide-react";
import AlertPopup from "@/components/Agency/ViewAgency/AlertPopup";
import AlertPopupWithState from "@/components/Agency/ViewAgency/AlertPopupWithState";
import { useSession } from "next-auth/react";

const EditAgencyArea = () => {
    const { data: session } = useSession()
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<EditAgencyAreaFormData>({
        resolver: zodResolver(editAgencyAreaSchema),
        defaultValues: {
            workingLevel: null,
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [agencies, setAgencies] = useState([]);
    const [workingLevels, setWorkingLevels] = useState([]);
    const [circles, setCircles] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sections, setSections] = useState([]);

    const [levelNameMappedWithId, setLevelNameMappedWithId] = useState<Record<string, number>>({})

    const getWorkingLevel = async () => {
        await getLevels(session?.user?.discomId).then((data) => {
            let levelIdMap = data?.data
                ?.filter((item) => item.levelType === "MAIN")
                .reduce((acc, item) => {
                    let levelName = item.levelName.replace(' ', "_");
                    acc[levelName] = item.id;
                    return acc;
                }, {});
            setWorkingLevels(
                data?.data
                    ?.filter((ite) => ite.levelType == "MAIN")
                    ?.map((ite) => {
                        return {
                            value: ite.id,
                            label: ite.levelName,
                        };
                    })
            );
            setValue('levelsData', levelIdMap)
            setLevelNameMappedWithId(levelIdMap)
        })
    }


    useEffect(() => {
        getWorkingLevel()
        getAgencyList()
        getLevelsDiscomId(session?.user?.discomId).then((data) => {
            setCircles(
                data?.data?.officeStructure?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.office_description,
                    };
                })
            );
        })
    }, []);

    const getDivisions = async (id, stopLoader = false) => {
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
            stopLoader && setIsLoading(false)
        })
    };

    const getSubDivisions = async (id, stopLoader = false) => {
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
            stopLoader && setIsLoading(false)
        })
    };

    const getSections = async (id, stopLoader = false) => {
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
            stopLoader && setIsLoading(false)
        })
    };

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId);
            setAgencies(
                response?.data?.map((item) => ({
                    ...item,
                    label: item.agency_name,
                    value: item.id,
                }))
            );

        } catch (error) {
            console.error("Failed to create agency:", error.data[Object.keys(error.data)[0]]);
        } finally {
            setIsLoading(false);
        }
    }

    const onSubmit = async () => {
        try {
            setIsSubmitting(true);
            let payload = {
                "agency_id": formData.agencyId,
                "working_office_structures": formData.workingLevel === levelNameMappedWithId.CIRCLE
                    ? formData.circle.map(Number)
                    : formData.workingLevel === levelNameMappedWithId.DIVISION
                        ? formData.division.map(Number)
                        : formData.workingLevel === levelNameMappedWithId.SUB_DIVISION
                            ? formData.subDivision.map(Number)
                            : formData.workingLevel === levelNameMappedWithId.SECTION ? formData.section.map(Number) : [],
                "working_level": formData.workingLevel
            }
            const response = await editAgencyAreaById(payload);
            toast.success("Agency details updated successfully!");
            getAgencyList()
            reset()
        } catch (error) {
            toast.error("Failed to update agency details.");
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formData = watch()
    const selectedAgency = watch('agency')

    const handleSetAllLevelData = async (data) => {
        try {
            handleWorkingLevelChange('')
            setIsLoading(true)
            let workingLevelId = data?.working_level;
            let workingLevelOffices = data?.working_level_offices?.map(item => item.id) || []
            let parentOfficeList = data?.parent_office_structure_hierarchy

            let circleId = parentOfficeList.filter(item => item?.office_structure_level_id === levelNameMappedWithId.CIRCLE)
            if (circleId.length > 0) {
                setValue('circle', [circleId[0]?.id]);
                setIsLoading(true)
                let divisionId = parentOfficeList.filter(item => item?.office_structure_level_id === levelNameMappedWithId.DIVISION)
                await getDivisions(circleId[0]?.id)
                if (divisionId.length > 0) {
                    setValue('division', [divisionId[0].id]);
                    setIsLoading(true)
                    let subDivisionId = parentOfficeList.filter(item => item?.office_structure_level_id === levelNameMappedWithId.SUB_DIVISION)
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
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchAgencyDetails = async () => {
        try {
            setIsLoading(true);
            const response = await getAgencyById(selectedAgency)
            const agencyDetails = response?.data;
            setValue("agencyId", agencyDetails.id);
            setValue("agencyName", agencyDetails.agency_name);
            setValue("workingLevel", agencyDetails.working_level);
            await handleSetAllLevelData(agencyDetails)
        } catch (error) {
            console.error("Failed to fetch agency details", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedAgency) {
            fetchAgencyDetails();
        }
    }, [selectedAgency]);


    const handleWorkingLevelChange = (e) => {
        setValue("circle", []);
        setValue("division", []);
        setValue("subDivision", []);
        setValue("section", []);
    }

    const [stateForConfirmationPopup, setStateForConfirmationPopup] = useState(false);

    return (
        <AuthUserReusableCode pageTitle="Edit Agency Area" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Select Agency"
                        list={agencies}
                        required
                        containerClass="col-span-2"
                        {...register("agency")}
                        errors={errors.agency}
                    />

                    <CustomizedInputWithLabel
                        label="Agency ID"
                        placeholder="Enter Agency ID"
                        disabled
                        {...register("agencyId", { valueAsNumber: true })}
                        errors={errors.agencyId}
                    />

                    <CustomizedInputWithLabel
                        label="Agency Name"
                        placeholder="Enter Agency Name"
                        disabled
                        {...register("agencyName")}
                        errors={errors.agencyName}
                    />


                    <CustomizedSelectInputWithLabel
                        label="Working Level"
                        list={workingLevels}
                        required
                        {...register("workingLevel", { valueAsNumber: true, onChange: handleWorkingLevelChange })}
                        errors={errors.workingLevel}
                    />
                    {formData.workingLevel != null && <>


                        <CustomizedMultipleSelectInputWithLabelNumber
                            label="Select Circle"
                            list={circles}
                            required
                            multi={formData.workingLevel == levelNameMappedWithId.CIRCLE}
                            errors={errors.circle}
                            value={watch('circle') || []}
                            onChange={(selectedValues) => {
                                setValue('circle', selectedValues)
                                if (selectedValues.length > 0 && formData.workingLevel != (levelNameMappedWithId.CIRCLE)) {
                                    getDivisions(selectedValues[0], true);
                                    setValue('division', [])
                                }
                            }}
                        />


                        {formData.workingLevel != (levelNameMappedWithId.CIRCLE) && (
                            <CustomizedMultipleSelectInputWithLabelNumber
                                label="Select Division"
                                list={divisions}
                                required
                                multi={formData.workingLevel == (levelNameMappedWithId.DIVISION)}
                                disabled={formData?.circle?.length == 0}
                                errors={errors.division}
                                value={watch('division') || []}
                                onChange={(selectedValues) => {
                                    setValue('division', selectedValues)
                                    if (selectedValues.length > 0 && formData.workingLevel != (levelNameMappedWithId.DIVISION)) {
                                        getSubDivisions(selectedValues[0], true);
                                        setValue('subDivision', [])
                                    }
                                }}
                            />
                        )}

                        {
                            (formData.workingLevel == (levelNameMappedWithId.SECTION)
                                || formData.workingLevel == (levelNameMappedWithId.SUB_DIVISION)) && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Select Sub Division"
                                    list={subDivisions}
                                    required
                                    multi={formData.workingLevel == (levelNameMappedWithId.SUB_DIVISION)}
                                    disabled={formData?.division?.length == 0}
                                    errors={errors.subDivision}
                                    value={watch('subDivision') || []}
                                    onChange={(selectedValues) => {
                                        setValue('subDivision', selectedValues)
                                        if (selectedValues.length > 0 && formData.workingLevel == (levelNameMappedWithId.SECTION)) {
                                            getSections(selectedValues[0], true);
                                            setValue('section', [])
                                        }
                                    }}
                                />
                            )
                        }

                        {
                            formData.workingLevel == (levelNameMappedWithId.SECTION) && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Select Section"
                                    list={sections}
                                    required
                                    multi={formData.workingLevel == (levelNameMappedWithId.SECTION)}
                                    disabled={formData?.subDivision?.length == 0}
                                    errors={errors.section}
                                    value={watch('section') || []}
                                    onChange={(selectedValues) => setValue('section', selectedValues)}
                                />
                            )
                        }
                    </>}

                </div>

                <div className="flex justify-end mt-4">
                    <AlertPopupWithState
                        triggerCode={
                            <Button
                                variant="default"
                                disabled={isSubmitting}
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
                        title="Update Agency"
                        description="Are you sure you want to update the Agency Working Area?"
                        continueButtonText="Yes"
                        isOpen={stateForConfirmationPopup}
                        setIsOpen={setStateForConfirmationPopup}
                    />
                    {/* <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                        </> : "Submit"}
                    </Button> */}
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default EditAgencyArea;
