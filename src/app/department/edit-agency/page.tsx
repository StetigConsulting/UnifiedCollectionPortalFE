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
import { editAgency, getAgenciesWithDiscom, getAgencyById } from '@/app/api-calls/department/api';
import { getErrorMessage, } from '@/lib/utils';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

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
        }

        try {
            setIsSubmitting(true);
            const response = await editAgency(payload);
            toast.success("Agency edited successfully");
            console.log("API Response:", response);
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
            });
            if (agencyIdFromUrl) {
                const url = new URL(window.location.href);
                url.search = '';
                window.history.pushState({}, '', url.href);
            }
            getAgencyList();
        } catch (error) {
            console.error("Failed to edit agency:", error.data[Object.keys(error.data)[0]]);
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
            console.log("Agency Data:", agency);
            setValue('agencyId', agency.id || null);
            setValue('agencyName', agency.agency_name || '');
            setValue('phoneNumber', agency.phone || '');
            setValue('address', agency.agency_address || '');
            setValue('maximumAmount', agency.maximum_limit || null);
            setValue('maximumAgent', agency.max_agent || null);
            setValue('woNumber', agency.wo_number || '');
            setValue('contactPerson', agency.contact_person || '');
            setAgencyList([{
                ...response.data,
                label: response.data.agency_name,
                value: response.data.id,
            }]);
            setValue('agency', response.data.id)
        } catch (error) {
            console.error("Failed to fetch agency by ID:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (agencyIdFromUrl) {
            fetchAgencyById(agencyIdFromUrl);
        } else {
            getAgencyList();
        }
    }, [agencyIdFromUrl]);

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId);
            console.log("API Response:", response);
            setAgencyList(
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
            }
        }
    }, [selectedAgency, agencyList, setValue]);

    return (
        <AuthUserReusableCode pageTitle="Edit Agency" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Select Agency"
                        errors={errors.agency}
                        containerClass="col-span-2"
                        placeholder="Select Agency"
                        list={agencyList}
                        required
                        {...register("agency")}
                    />
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
                        placeholder="Enter Maximum Amount"
                        {...register('maximumAmount', { valueAsNumber: true })}
                    />
                    <CustomizedInputWithLabel
                        label="Maximum Agent"
                        errors={errors.maximumAgent}
                        required
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
                    <div className="grid grid-cols-3 gap-4 col-span-2">
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
                            placeholder="Enter Phone Number"
                            {...register('phoneNumber')}
                        />
                    </div>
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

export default EditAgency;
