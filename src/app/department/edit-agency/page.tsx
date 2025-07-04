'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editAgencySchema } from '@/lib/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { editAgency, getAgenciesWithDiscom, getAgencyById, getAllGlobalPaymentMode, getAllNonEnergyTypes, getAllPaymentModes } from '@/app/api-calls/department/api';
import { getErrorMessage, } from '@/lib/utils';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import CustomizedMultipleSelectInputWithLabelString from '@/components/CustomizedMultipleSelectInputWithLabelString';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { checkIfUserHasActionAccess } from '@/helper';
import AlertPopupWithState from '@/components/Agency/ViewAgency/AlertPopupWithState';

type FormData = z.infer<typeof editAgencySchema>;

const EditAgency = () => {
    const { data: session } = useSession();
    const currentUserId = session?.user?.userId

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(editAgencySchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: FormData) => {

        let payload = {
            "id": data.agencyId,
            "user_id": currentUserId,
            "agency_name": data.agencyName,
            "agency_address": data.address,
            "wo_number": data.woNumber,
            'contact_person': data.contactPerson,
            "phone": data.phoneNumber,
            "maximum_limit": data.maximumAmount,
            "max_agent": data.maximumAgent,
            "vendor_id": data.vendorCode,
            "collection_type_energy": data.collectionType?.includes("Energy"),
            "collection_type_non_energy": data.collectionType?.includes("Non-Energy"),
            "non_energy_types": data.collectionType?.includes("Non-Energy") ? data.nonEnergy : [],
            "collection_payment_modes": data.permission,
        }

        try {
            setIsSubmitting(true);
            const response = await editAgency(payload);
            toast.success("Agency edited successfully");
            reset({
                agency: null,
                agencyId: null,
                agencyName: "",
                maximumAmount: 0,
                maximumAgent: 0,
                address: "",
                woNumber: "",
                contactPerson: "",
                phoneNumber: "",
                vendorCode: "",
                collectionType: [],
                nonEnergy: [],
                permission: []
            });
            if (agencyIdFromUrl) {
                const url = new URL(window.location.href);
                url.search = '';
                window.history.pushState({}, '', url.href);
            }
            getAgencyList();
        } catch (error) {
            let errorMessage = getErrorMessage(error);
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false);
        }
    };

    const [agencyList, setAgencyList] = useState([])

    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams();
    const agencyIdFromUrl = searchParams.get('id');

    const fetchAgencyById = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await getAgencyById(id);
            const agency = response.data;
            setAgencyList([{
                ...response.data,
                label: response.data.agency_name,
                value: response.data.id,
            }]);
            setValue('agencyId', agency.id || null);
            setValue('agencyName', agency.agency_name || '');
            setValue('phoneNumber', agency.phone || '');
            setValue('address', agency.agency_address || '');
            setValue('maximumAmount', agency.maximum_limit || null);
            setValue('maximumAgent', agency.max_agent || null);
            setValue('woNumber', agency.wo_number || '');
            setValue('contactPerson', agency.contact_person || '');
            setValue('vendorCode', agency.vendor_id || '');
            let paymentMode = [];
            paymentMode = agency.collection_payment_modes?.map((item) => item.id);
            setValue('permission', paymentMode || []);
            let collectionType = [];
            if (agency.collection_type_energy) {
                collectionType.push("Energy");
            }
            if (agency.collection_type_non_energy) {
                collectionType.push("Non-Energy");
            }
            setValue('collectionType', collectionType || []);
            let nonEnergy = [];
            nonEnergy = agency.non_energy_types?.map((item) => item.id);
            setValue('nonEnergy', nonEnergy || []);
            setValue('agency', agency.id)
        } catch (error) {
            console.error("Failed to fetch agency by ID:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const [nonEnergyTypes, setNonEnergyTypes] = useState([])
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        if (agencyIdFromUrl) {
            fetchAgencyById(agencyIdFromUrl);
        } else {
            getAgencyList();
        }
        getAllNonEnergyTypes().then((data) => {
            setNonEnergyTypes(
                data?.data?.map((ite) => {
                    return {
                        label: ite.type_name,
                        value: ite.id,
                    };
                })
            );
        })
    }, [agencyIdFromUrl]);

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId);
            setAgencyList(
                response?.data?.map((item) => ({
                    ...item,
                    label: item.agency_name,
                    value: item.id,
                }))
            );

        } catch (error) {
            console.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }

    }

    const selectedAgency = watch('agency');

    useEffect(() => {
        if (selectedAgency) {
            const agency = agencyList.find((item) => item.id === Number(selectedAgency));
            if (agency) {
                setValue('agencyId', agency.id || null);
                setValue('agencyName', agency.agency_name || '');
                setValue('phoneNumber', agency.phone || '');
                setValue('address', agency.agency_address || '');
                setValue('maximumAmount', agency.maximum_limit || null);
                setValue('maximumAgent', agency.max_agent || null);
                setValue('woNumber', agency.wo_number || '');
                setValue('contactPerson', agency.contact_person || '');
                setValue('vendorCode', agency.vendor_id || '');
                let paymentMode = [];
                paymentMode = agency.collection_payment_modes?.map((item) => item.id);
                setValue('permission', paymentMode || []);
                let collectionType = [];
                if (agency.collection_type_energy) {
                    collectionType.push("Energy");
                }
                if (agency.collection_type_non_energy) {
                    collectionType.push("Non-Energy");
                }
                setValue('collectionType', collectionType || []);
                let nonEnergy = [];
                nonEnergy = agency.non_energy_types?.map((item) => item.id);
                setValue('nonEnergy', nonEnergy || []);
            }
        }
    }, [selectedAgency, agencyList, setValue]);

    useEffect(() => {
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
        }).catch((err) => { })
    }, [])

    const formData = watch();

    const [openConfirmationPopup, setOpenConfirmationPopup] = useState(false);

    return (
        <AuthUserReusableCode pageTitle="Edit Agency" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {!agencyIdFromUrl &&
                        <CustomizedSelectInputWithLabel
                            label="Select Agency"
                            errors={errors.agency}
                            containerClass="col-span-2"
                            placeholder="Select Agency"
                            list={agencyList}
                            required
                            {...register("agency")}
                        />
                    }
                    <CustomizedInputWithLabel
                        label="Agency ID"
                        errors={errors.agencyId}
                        placeholder="Agency ID"
                        {...register('agencyId')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        errors={errors.agencyName}
                        required
                        placeholder="Enter Agency Name"
                        {...register('agencyName')}
                    />
                    <CustomizedInputWithLabel
                        label="Maximum Amount"
                        errors={errors.maximumAmount}
                        required
                        type="number"
                        placeholder="Enter Maximum Amount"
                        {...register('maximumAmount', { valueAsNumber: true })}
                    />
                    <CustomizedInputWithLabel
                        label="Maximum Agent"
                        errors={errors.maximumAgent}
                        required
                        type="number"
                        placeholder="Enter Maximum Agent"
                        {...register('maximumAgent', { valueAsNumber: true })}
                    />
                    <CustomizedInputWithLabel
                        label="Address"
                        errors={errors.address}
                        required
                        containerClass="col-span-2"
                        placeholder="Enter New Address"
                        {...register('address')}
                    />
                    <CustomizedInputWithLabel
                        label="WO Number"
                        errors={errors.woNumber}
                        placeholder="Enter WO Number"
                        {...register('woNumber')}
                    />
                    <CustomizedInputWithLabel
                        label="Contact Person"
                        errors={errors.contactPerson}
                        required
                        placeholder="Enter Contact Person"
                        {...register('contactPerson')}
                    />
                    <CustomizedInputWithLabel
                        label="Phone Number"
                        errors={errors.phoneNumber}
                        required
                        type="number"
                        placeholder="Enter Phone Number"
                        {...register('phoneNumber')}
                    />

                    <CustomizedInputWithLabel
                        label="Vendor ID"
                        errors={errors.vendorCode}
                        disabled={checkIfUserHasActionAccess(
                            {
                                backendScope: session?.user?.userScopes,
                                currentAction: 'disableVendorCode'
                            })}
                        placeholder="Enter Vendor ID"
                        {...register('vendorCode')}
                    />
                    <CustomizedMultipleSelectInputWithLabelNumber
                        label="Permissions"
                        errors={errors.permission}
                        placeholder="Select permission"
                        list={permissions}
                        required={true}
                        value={watch('permission') || []}
                        multi={true}
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

                    {formData?.collectionType &&
                        formData?.collectionType?.includes("Non-Energy") ? (
                        <CustomizedMultipleSelectInputWithLabelNumber
                            label="Non Energy"
                            list={nonEnergyTypes}
                            required={true}
                            errors={errors.nonEnergy}
                            value={watch('nonEnergy') || []}
                            multi={true}
                            onChange={(selectedValues) => setValue('nonEnergy', selectedValues)}
                        />
                    ) : (
                        <></>
                    )}

                </div>
                <div className="flex justify-end mt-4">
                    <AlertPopupWithState isOpen={openConfirmationPopup} setIsOpen={setOpenConfirmationPopup}
                        triggerCode={<Button variant="default" disabled={isSubmitting}>
                            {isSubmitting ? <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                            </> : "Submit"}
                        </Button>} handleContinue={handleSubmit(onSubmit)}
                        title=''
                        description='This action may affect the current payment methods for agencies and agents. Do you wish to proceed?'
                        continueButtonText='Yes'
                    />
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default EditAgency;
