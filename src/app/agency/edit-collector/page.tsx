"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editCollectorSchema, EditCollectorFormData } from "@/lib/zod";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CustomizedMultipleSelectInputWithLabelString from "@/components/CustomizedMultipleSelectInputWithLabelString";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { getAgenciesWithDiscom, getAgencyById, getAgentByPhoneNumber, getListOfAllSupervisor } from "@/app/api-calls/department/api";
import { agentWorkingType, getErrorMessage } from "@/lib/utils";
import { editCollectorData, getAllAgentByAgencyId, getCollectorTypes } from "@/app/api-calls/agency/api";
import CustomizedMultipleSelectInputWithLabelNumber from "@/components/CustomizedMultipleSelectInputWithLabelNumber";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import SuccessErrorModal from "@/components/SuccessErrorModal";
import AlertPopupWithState from "@/components/Agency/ViewAgency/AlertPopupWithState";
import { checkIfUserHasActionAccess } from "@/helper";
import CustomizedSelectInputWithSearch from "@/components/CustomizedSelectInputWithSearch";

const EditCollector = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, setError, reset, clearErrors } = useForm<EditCollectorFormData>({
        resolver: zodResolver(editCollectorSchema),
    });

    const { data: session } = useSession()
    const currentUserId = session?.user?.userId

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [collectorTypes, setCollectorTypes] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [collectionTypes, setCollectionTypes] = useState(
        [
            { label: "Energy", value: "Energy" },
            { label: "Non Energy", value: "Non Energy" },
        ]);
    const [nonEnergyTypes, setNonEnergyTypes] = useState([]);

    const [supervisorList, setSupervisorList] = useState([])

    useEffect(() => {
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
    }, []);

    const onSubmit = async (data: EditCollectorFormData) => {
        if (formData.workingType === 'Offline' && formData?.collectionType?.includes('Non Energy')) {
            setErrorMessage('Error: Non Energy Collection Type can only be assigned to Online Work Type Agents')
            setIsErrorModalOpen(true)
            return
        }
        setIsSubmitting(true)
        try {
            let payload = {
                "agent_id": data.agentId,
                "collection_payment_modes": data.permission,
                "collection_type_energy": data.collectionType.includes("Energy") ? true : false,
                "collection_type_non_energy": data.collectionType.includes("Non Energy") ? true : false,
                "non_energy_types": data.collectionType.includes("Non Energy") ? data.nonEnergy : [],
                "collector_type": data.collectorType,
                "work_type": data.workingType,
                "supervisor_id": data?.supervisor?.[0] || null,
                "aadhar_no": data.aadhaarNumber || null,
                "vendor_id": data.vendorId || null,
                "maximum_limit": data.maximumLimit || null,
            }
            await editCollectorData(payload, currentUserId);
            toast.success('Agent edited successfully!');
            reset()
            window.location.reload()
        } catch (error) {
            let errorMessage = getErrorMessage(error);
            toast.error('Error: ' + errorMessage);
        } finally {
            setIsSubmitting(false)
        }
    };

    const [showRestFields, setShowRestFields] = useState(false);

    const handleGetAgentData = async () => {
        const mobileNumber = Number(watch('collectorMobile'));
        if (!isNaN(mobileNumber) && mobileNumber.toString().length === 10) {
            try {
                setIsLoading(true);
                const response = await getAgentByPhoneNumber(mobileNumber);
                setValue('name', response.data.agent_name)
                setValue('phoneNumber', response.data.secondary_phone || '');
                setValue('collectorType', response.data.collector_type.id)
                setValue('workingType', response.data.work_type)
                setValue('agentId', response.data.id)
                setValue('agencyId', response.data.agency.id)
                setValue('agencyName', response.data.agency.agency_name)
                let supervisorData = response.data.supervisor?.id ? [response.data.supervisor?.id] : []
                setValue('supervisor', supervisorData)
                setValue('aadhaarNumber', response.data.aadharNo || null)
                setValue('vendorId', response.data.vendor_id || null)
                setValue('maximumLimit', response.data.maximum_limit || null)
                await getAgencyData(response.data.agency.id)
                setValue('permission', response.data.collection_payment_modes.map((ite) => ite.id))
                let collectionType = []
                if (response.data.collection_type_energy) {
                    collectionType.push('Energy')
                }
                if (response.data.collection_type_non_energy) {
                    collectionType.push('Non Energy')
                }
                setValue('collectionType', collectionType)
                setValue('nonEnergy', response.data.non_energy_types.map((ite) => ite.id))
            } catch (error) {
                let errorMessage = getErrorMessage(error);
                toast.error('Error: ' + errorMessage || error.message)
                setShowRestFields(false)
            } finally {
                setIsLoading(false);
            }
        } else {
            if (formData?.tempAgencyId) {
                setError("collectorMobile", {
                    type: "manual",
                    message: "Please select an agent.",
                });
            } else {
                setError("tempAgencyId", {
                    type: "manual",
                    message: "Please select an agency.",
                });
            }
            return;
        }
    }

    const [agencyData, setAgencyData] = useState({ is_inherited_vendor_id: false, vendor_id: '' })

    const getAgencyData = async (id: number) => {
        try {
            const agencyResponse = await getAgencyById(String(id));
            const agencyData = agencyResponse.data;
            await getListOfAllSupervisor(id).then((res) => {
                setSupervisorList(res?.data
                    ?.filter(item => item?.is_active === true)
                    ?.map(item => ({
                        ...item,
                        label: item?.supervisor_name,
                        value: item?.id
                    })))
            }).catch(err => console.error(err))
            setAgencyData(agencyData);

            let collectionTypesList = [];

            if (agencyData?.collection_type_energy) {
                collectionTypesList.push({
                    label: 'Energy',
                    value: 'Energy',
                })
            }
            if (agencyData?.collection_type_non_energy) {
                collectionTypesList.push({
                    label: 'Non Energy',
                    value: 'Non Energy',
                })
            }

            setCollectionTypes(collectionTypesList)

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

    const formData = watch()

    const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {

        if (formData.workingType === 'Offline' && formData?.collectionType?.includes('Non Energy')) {
            setErrorMessage('Error: Non Energy Collection Type can only be assigned to Online Work Type Agents')
            setIsErrorModalOpen(true)
            let filterList = formData?.collectionType?.filter(item => item !== 'Non Energy')
            setValue('collectionType', filterList || [])
        }
    }, [formData.workingType, formData.collectionType, setValue]);

    const [stateForConfirmationPopup, setStateForConfirmationPopup] = useState(false);

    const [agencyOptions, setAgencyOptions] = useState<{ label: string; value: string; id: number }[]>([]);
    const [agentOptions, setAgentOptions] = useState<{ label: string; value: string }[]>([]);

    const fetchAgencies = async () => {
        try {
            const agencies = await getAgenciesWithDiscom(session?.user?.discomId);
            setAgencyOptions(
                agencies?.data?.map((a: any) => ({
                    label: a.agency_name + ' - ' + a.phone,
                    value: a.id,
                })) || []
            );
        } catch (e) {
            setAgencyOptions([]);
        }
    };

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgents = async (agencyId: string) => {
        if (!agencyId) {
            setAgentOptions([]);
            setValue("tempAgencyId", "");
            return;
        }
        setIsLoading(true)
        try {
            const agents = await getAllAgentByAgencyId(Number(agencyId));
            setAgentOptions(
                agents?.data?.map((a: any) => ({
                    label: a.agent_name + ' - ' + a.primary_phone,
                    value: a.primary_phone
                })) || []
            );
        } catch (e) {
            setAgentOptions([]);
            setValue("tempAgencyId", "");
        } finally {
            setIsLoading(false)
        }
    };

    const resetForm = () => {
        setValue('name', '')
        setValue('phoneNumber', '')
        setValue('collectorType', null)
        setValue('workingType', '')
        setValue('permission', [])
        setValue('collectionType', [])
        setValue('nonEnergy', [])
        setValue('supervisor', [])
        setValue('aadhaarNumber', '')
        setValue('agencyId', undefined)
        setValue('agencyName', '')
        setValue('vendorId', undefined)
        setAgencyData({ is_inherited_vendor_id: false, vendor_id: '' })
        setShowRestFields(false)
    }

    console.log(errors)

    return (
        <AuthUserReusableCode pageTitle="Edit Agent" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithSearch
                        label="Agency Name"
                        placeholder="Search Agency"
                        list={agencyOptions}
                        value={formData.tempAgencyId}
                        onChange={(value: string) => {
                            setValue("tempAgencyId", value)
                            setValue("collectorMobile", undefined)
                            setAgentOptions([])
                            setValue('agencyName', '')
                            clearErrors('tempAgencyId')
                            resetForm()
                            fetchAgents(value)
                        }}
                        errors={errors.agencyName}
                    />
                    <CustomizedSelectInputWithSearch
                        label="Agent Mobile Number"
                        placeholder="Search Agent"
                        list={agentOptions}
                        value={formData.collectorMobile}
                        disabled={!formData.tempAgencyId}
                        onChange={(value: string) => {
                            console.log(value)
                            setValue("collectorMobile", value)
                            clearErrors('collectorMobile')
                            resetForm()
                        }}
                        errors={errors.collectorMobile}
                    />
                    <div className='col-span-2 text-end'>
                        <Button type="button" onClick={handleGetAgentData} disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Search'}
                        </Button>
                    </div>
                    <CustomizedInputWithLabel
                        label="Agency ID"
                        disabled
                        {...register("agencyId")}
                        errors={errors.agencyId}
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        disabled
                        {...register("agencyName")}
                        errors={errors.agencyName}
                    />
                    <CustomizedInputWithLabel
                        label="Agent Name"
                        placeholder="Enter Name"
                        disabled
                        {...register("name")}
                        errors={errors.name}
                    />
                    <CustomizedInputWithLabel
                        label="Personal Phone Number"
                        placeholder="Enter Phone Number"
                        disabled
                        {...register("phoneNumber")}
                        errors={errors.phoneNumber}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Agent Type"
                        list={collectorTypes}
                        {...register("collectorType", { valueAsNumber: true })}
                        errors={errors.collectorType}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Working Type"
                        list={agentWorkingType}
                        {...register("workingType")}
                        errors={errors.workingType}
                    />
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
                        list={collectionTypes}
                        multi={true}
                        required={true}
                        placeholder="Select Collection Type"
                        errors={errors.collectionType}
                        value={watch('collectionType') || []}
                        onChange={(selectedValues) => setValue('collectionType', selectedValues)}
                    />

                    {watch("collectionType")?.includes("Non Energy") && (
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

                    <CustomizedInputWithLabel label='Maximum Limit' type='number'
                        {...register("maximumLimit", { valueAsNumber: true })} errors={errors.maximumLimit} />

                    <CustomizedMultipleSelectInputWithLabelNumber
                        label="Select Supervisor"
                        errors={errors.supervisor}
                        placeholder="Select Supervisor"
                        list={supervisorList}
                        value={watch('supervisor') || []}
                        onChange={(selectedValues) => setValue('supervisor', selectedValues)}
                    />

                    <CustomizedInputWithLabel label='Aadhaar Number' errors={errors.aadhaarNumber}
                        placeholder='Enter Aadhaar Number' type='number'
                        disabled={checkIfUserHasActionAccess({
                            backendScope: session?.user?.userScopes,
                            currentAction: 'disabledAadharEdit'
                        })}
                        {...register('aadhaarNumber', { valueAsNumber: true })} />

                    <CustomizedInputWithLabel label='Vendor Id' errors={errors.vendorId}
                        placeholder='Enter Vendor Id'
                        disabled={checkIfUserHasActionAccess({
                            backendScope: session?.user?.userScopes,
                            currentAction: 'disabledVendorIdEdit'
                        }) || agencyData?.is_inherited_vendor_id}
                        {...register('vendorId')} />
                    {
                        agencyData?.is_inherited_vendor_id &&
                        <CustomizedInputWithLabel label='Inherited Agency Vendor Id'
                            value={agencyData?.vendor_id} disabled />
                    }
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
                        title="Confirm Edit Agent"
                        description="Are you sure you want to edit this Agent?"
                        continueButtonText="Yes"
                        isOpen={stateForConfirmationPopup}
                        setIsOpen={setStateForConfirmationPopup}
                    />

                    {/* <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </Button> */}
                </div>
            </form>
            <SuccessErrorModal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}
                message={errorMessage} type="error" />
        </AuthUserReusableCode>
    );
};

export default EditCollector;
