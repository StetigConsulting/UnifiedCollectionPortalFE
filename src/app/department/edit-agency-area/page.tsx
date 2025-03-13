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
import { editAgencyAreaById, getAgenciesWithDiscom, getLevels, getLevelsDiscomId } from "@/app/api-calls/department/api";
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
        getLevels(session?.user?.discomId).then((data) => {
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
        })
    }, []);

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

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId);
            console.log("API Response:", response);
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

    console.log(formData);

    useEffect(() => {
        if (selectedAgency) {
            const agency = agencies.find((item) => item.id === Number(selectedAgency));
            if (agency) {
                setValue("agencyId", agency.id);
                setValue("agencyName", agency.agency_name);
                setValue('workingLevel', agency.working_level);
                setValue('circle', [])
                setValue('division', [])
                setValue('subDivision', [])
                setValue('section', [])
                if (agency.working_level == levelNameMappedWithId.CIRCLE) {
                    const level = agency.working_level_offices?.map((data) => data.id) || [];
                    console.log("Setting Circle:", level);
                    setValue("circle", level.length > 0 ? level : []);
                }
                if (agency.working_level == levelNameMappedWithId.DIVISION) {
                    const level = agency.working_level_offices?.map((data) => data.id) || [];
                    console.log("Setting Circle:", level, agency.working_level_offices);
                    let parentId = agency.working_level_offices?.[0]?.parent_office_id;
                    console.log(agency.working_level_offices, parentId)
                    setValue("circle", [parentId]);
                    getDivisions(parentId)
                    setValue("division", level.length > 0 ? level : []);
                }
                // if (agency.working_level == levelNameMappedWithId.SUB_DIVISION) {
                //     const level = agency.working_level_offices?.map((data) => data.id) || [];
                //     console.log("Setting Circle:", level, agency.working_level_offices);
                //     let parentId = agency.working_level_offices?.[0]?.parent_office_id;
                //     console.log(agency.working_level_offices, parentId)
                //     getSubDivisions(parentId)
                //     setValue("subDivision", level.length > 0 ? level : []);
                //     setValue("circle", [parentId]);
                //     // getDivisions(parentId)
                //     setValue("division", [parentId]);

                // }
                console.log(agency)
            }
        }
    }, [selectedAgency, agencies, setValue]);

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
                                    getDivisions(selectedValues[0]);
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
                                        getSubDivisions(selectedValues[0]);
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
                                            getSections(selectedValues[0]);
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
