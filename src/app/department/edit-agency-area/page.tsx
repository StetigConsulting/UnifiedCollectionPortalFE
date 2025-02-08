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
import { levelWIthId, testAgencyId, testDiscom } from "@/lib/utils";
import CustomizedMultipleSelectInputWithLabelNumber from "@/components/CustomizedMultipleSelectInputWithLabelNumber";
import { Loader2 } from "lucide-react";

const EditAgencyArea = () => {
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

    useEffect(() => {
        getAgencyList()
        getLevelsDiscomId(testDiscom).then((data) => {
            setCircles(
                data?.data?.officeStructure?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.office_description,
                    };
                })
            );
        })
        getLevels(testDiscom).then((data) => {
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
            const response = await getAgenciesWithDiscom(testDiscom);
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

    const onSubmit = async (data: EditAgencyAreaFormData) => {
        try {
            setIsSubmitting(true);
            let payload = {
                "agency_id": data.agencyId,
                "working_office_structures": data.workingLevel === levelWIthId.CIRCLE
                    ? data.circle.map(Number)
                    : data.workingLevel === levelWIthId.DIVISION
                        ? data.division.map(Number)
                        : data.workingLevel === levelWIthId.SUB_DIVISION
                            ? data.subDivision.map(Number)
                            : data.workingLevel === levelWIthId.SECTION ? data.section.map(Number) : [],
                "working_level": parseInt(data.workingLevel)
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
                setValue('workingLevel', String(agency.working_level));
                setValue('circle', [])
                setValue('division', [])
                setValue('subDivision', [])
                setValue('section', [])
                if (agency.working_level == levelWIthId.CIRCLE) {
                    const level = agency.working_level_offices?.map((data) => data.id) || [];
                    console.log("Setting Circle:", level);
                    setValue("circle", level.length > 0 ? level : []);
                }
                if (agency.working_level == levelWIthId.DIVISION) {
                    const level = agency.working_level_offices?.map((data) => data.id) || [];
                    console.log("Setting Circle:", level, agency.working_level_offices);
                    let parentId = agency.working_level_offices?.[0]?.parent_office_id;
                    console.log(agency.working_level_offices, parentId)
                    setValue("circle", [parentId]);
                    getDivisions(parentId)
                    setValue("division", level.length > 0 ? level : []);
                }
                // if (agency.working_level == levelWIthId.SUB_DIVISION) {
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
                        {...register("agencyId")}
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
                        {...register("workingLevel", { onChange: handleWorkingLevelChange })}
                        errors={errors.workingLevel}
                    />
                    {formData.workingLevel != null && <>


                        <CustomizedMultipleSelectInputWithLabelNumber
                            label="Select Circle"
                            list={circles}
                            required
                            multi={formData.workingLevel == levelWIthId.CIRCLE}
                            errors={errors.circle}
                            value={watch('circle') || []}
                            onChange={(selectedValues) => {
                                setValue('circle', selectedValues)
                                if (selectedValues.length > 0 && formData.workingLevel != (levelWIthId.CIRCLE)) {
                                    getDivisions(selectedValues[0]);
                                    setValue('division', [])
                                }
                            }}
                        />


                        {formData.workingLevel != (levelWIthId.CIRCLE) && (
                            <CustomizedMultipleSelectInputWithLabelNumber
                                label="Select Division"
                                list={divisions}
                                required
                                multi={formData.workingLevel == (levelWIthId.DIVISION)}
                                disabled={formData?.circle?.length == 0}
                                errors={errors.division}
                                value={watch('division') || []}
                                onChange={(selectedValues) => {
                                    setValue('division', selectedValues)
                                    if (selectedValues.length > 0 && formData.workingLevel != (levelWIthId.DIVISION)) {
                                        getSubDivisions(selectedValues[0]);
                                        setValue('subDivision', [])
                                    }
                                }}
                            />
                        )}

                        {
                            (formData.workingLevel == (levelWIthId.SECTION)
                                || formData.workingLevel == (levelWIthId.SUB_DIVISION)) && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Select Sub Division"
                                    list={subDivisions}
                                    required
                                    multi={formData.workingLevel == (levelWIthId.SUB_DIVISION)}
                                    disabled={formData?.division?.length == 0}
                                    errors={errors.subDivision}
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
                            formData.workingLevel == (levelWIthId.SECTION) && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Select Section"
                                    list={sections}
                                    required
                                    multi={formData.workingLevel == (levelWIthId.SECTION)}
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
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                        </> : "Submit"}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default EditAgencyArea;
