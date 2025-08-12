'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { CreateNewUserFormData, createNewUserSchema } from '@/lib/zod';
import { createUser, getAllUserRoles } from '@/app/api-calls/admin/api';
import { getErrorMessage } from '@/lib/utils';
import { getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { useSession } from 'next-auth/react';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import SuccessErrorModal from "@/components/SuccessErrorModal";


const CreateUserForm = () => {

    const { data: session } = useSession();

    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<CreateNewUserFormData>({
        resolver: zodResolver(createNewUserSchema),
        defaultValues: {
            needOfficeStructure: false,
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [userRolesList, setUserRolesList] = useState([]);

    const [isErrorModalOpened, setIsErrorModalOpened] = useState(false);
    const [modalType, setModaltype] = useState('error')
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit = async (data: CreateNewUserFormData) => {
        setIsSubmitting(true);
        try {
            let payload = {
                user_role_id: data.userRole,
                user_name: data.name,
                mobile_number: data.phoneNumber,
                office_structure_id: data.workingLevel === levelNameMappedWithId.CIRCLE
                    ? data?.circle?.[0]
                    : data.workingLevel === levelNameMappedWithId.DIVISION
                        ? data.division?.[0]
                        : data.workingLevel === levelNameMappedWithId.SUB_DIVISION
                            ? data.subDivision?.[0]
                            : data.workingLevel === levelNameMappedWithId.SECTION ? data.section?.[0] : null,
            }

            const response = await createUser(payload);
            setModaltype('success')
            setIsErrorModalOpened(true);
            setErrorMessage('New User Created Successfully');
            reset();
        } catch (error) {
            setIsErrorModalOpened(true);
            setModaltype('error')
            setErrorMessage('Error: ' + getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAllUserRolePicklist = async () => {
        try {
            setIsLoading(true);
            const data = await getAllUserRoles();
            setUserRolesList(
                data?.data
                    ?.filter((ite) => ite.role_user_creation_from_ui === true)
                    .map((ite) => ({
                        value: ite.id,
                        label: ite.role_name,
                        office_structure: ite?.office_structure_role
                    }))
            );
        } catch (error) {
            console.error('Error fetching user roles: '+ getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getAllUserRolePicklist();
        getWorkingLevel()
        getCircles(session?.user?.discomId)
    }, [])

    const [levelNameMappedWithId, setLevelNameMappedWithId] = useState<Record<string, number>>({})
    const [workingLevel, setWorkingLevel] = useState([]);

    const getWorkingLevel = () => {
        setIsLoading(true)
        getLevels(session?.user?.discomId).then((data) => {
            let levelIdMap = data?.data
                ?.filter((item) => item.levelType === "MAIN")
                .reduce((acc, item) => {
                    let levelName = item.levelName.replace(' ', "_");
                    acc[levelName] = item.id;
                    return acc;
                }, {});
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
            setLevelNameMappedWithId(levelIdMap)
            setValue('levelWithIdMap', levelIdMap)
            setIsLoading(false)
        })
    }

    const [circles, setCircles] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sections, setSections] = useState([]);

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

    const formData = watch();

    return (
        <AuthUserReusableCode pageTitle="Create New User" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <CustomizedSelectInputWithLabel
                    label="User Role"
                    required
                    list={userRolesList}
                    {...register('userRole', {
                        valueAsNumber: true, onChange: (e) => {
                            let value = Number(e.target.value);
                            let selected = userRolesList?.filter((item) => item.value == value)
                            if (selected.length > 0 && selected[0]?.office_structure) {
                                setValue('needOfficeStructure', selected[0]?.office_structure);
                            } else {
                                setValue('needOfficeStructure', false);
                            }
                        }
                    })}
                    errors={errors.userRole}
                />
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Name"
                        placeholder="Enter Name"
                        required
                        {...register('name')}
                        errors={errors.name}
                    />
                    <CustomizedInputWithLabel
                        label="Phone Number"
                        placeholder="Enter Phone Number"
                        required
                        type="number"
                        {...register('phoneNumber')}
                        errors={errors.phoneNumber}
                    />
                    {
                        formData?.needOfficeStructure &&
                        <>
                            <CustomizedSelectInputWithLabel
                                label='Working Level'
                                required={true}
                                list={workingLevel}
                                {...register('workingLevel', { valueAsNumber: true })}
                                errors={errors.workingLevel}
                            />
                            {
                                formData.workingLevel != null && !Number.isNaN(formData.workingLevel) &&
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Circle"
                                    errors={errors.circle}
                                    placeholder="Select Circle"
                                    list={circles}
                                    required={true}
                                    value={watch('circle') || []}
                                    onChange={(selectedValues) => {
                                        setValue('circle', selectedValues)
                                        if (selectedValues.length > 0) {
                                            getDivisions(selectedValues[0]);
                                        }
                                    }}
                                />
                            }
                            {
                                formData.workingLevel != null && !Number.isNaN(formData.workingLevel) &&
                                ((formData.workingLevel == levelNameMappedWithId?.SUB_DIVISION ||
                                    formData.workingLevel == levelNameMappedWithId?.DIVISION ||
                                    formData.workingLevel == levelNameMappedWithId?.SECTION)) &&
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Division"
                                    errors={errors.division}
                                    placeholder="Select Division"
                                    list={divisions}
                                    required={true}
                                    value={watch('division') || []}
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
                                && ((formData.workingLevel == levelNameMappedWithId?.SECTION
                                    || formData.workingLevel == levelNameMappedWithId?.SUB_DIVISION)) && (
                                    <CustomizedMultipleSelectInputWithLabelNumber
                                        label="Sub Division"
                                        errors={errors.subDivision}
                                        placeholder="Select Sub Division"
                                        list={subDivisions}
                                        required={true}
                                        value={watch('subDivision') || []}
                                        onChange={(selectedValues) => {
                                            setValue('subDivision', selectedValues)
                                            if (selectedValues.length > 0) {
                                                getSections(selectedValues[0]);
                                            }
                                        }}
                                    />)
                            }
                            {formData.workingLevel != null &&
                                formData.workingLevel == levelNameMappedWithId?.SECTION && (
                                    <CustomizedMultipleSelectInputWithLabelNumber
                                        label="Section"
                                        errors={errors.section}
                                        placeholder="Select Section"
                                        list={sections}
                                        required={true}
                                        value={watch('section') || []}
                                        onChange={(selectedValues) => setValue('section', selectedValues)}
                                    />)
                            }
                        </>
                    }
                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                </div>
            </form>
            <SuccessErrorModal
                isOpen={isErrorModalOpened}
                onClose={() => setIsErrorModalOpened(false)}
                message={errorMessage}
                type={modalType}
            />
        </AuthUserReusableCode>
    );
};

export default CreateUserForm;
