'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extendValiditySchema } from '@/lib/zod';
import { z } from 'zod';
import { extendValidity, getAgenciesWithDiscom, getAgencyById } from '@/app/api-calls/department/api';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

type FormData = z.infer<typeof extendValiditySchema>;

const ExtendValidity = () => {
    const { data: session } = useSession()
    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(extendValiditySchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (data: FormData) => {

        let payload = {
            agency_id: data.agencyId,
            validity_from_date: data.newFromValidity,
            validity_to_date: data.newToValidity
        }

        try {
            setIsSubmitting(true);
            const response = await extendValidity(payload);
            toast.success("Validity extended successfully");
            console.log("API Response:", response);
            getAgencyList()
            reset({
                agencyName: null,
                agencyId: null,
                currentFromValidity: '',
                currentToValidity: '',
                newFromValidity: '',
                newToValidity: '',
            });
            if (agencyIdFromUrl) {
                const url = new URL(window.location.href);
                url.search = '';
                window.history.pushState({}, '', url.href);
            }
        } catch (error) {
            console.error("Failed to extend validity:", error);
            let errorMessage = error?.data ? error?.data[Object.keys(error?.data)[0]] : error.error;
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false);
        }
    };

    const [agencyList, setAgencyList] = useState([])

    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams();
    const agencyIdFromUrl = searchParams.get('id');

    useEffect(() => {
        if (agencyIdFromUrl) {
            fetchAgencyById(agencyIdFromUrl);
        } else {
            getAgencyList();
        }
    }, [agencyIdFromUrl]);

    const fetchAgencyById = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await getAgencyById(id);
            const agency = response.data;
            console.log("Agency Data:", agency);
            setValue('agencyId', agency.id || '');
            setValue('agencyName', agency.id || '');
            setValue('currentFromValidity', agency.validity_start_date || '');
            setValue('currentToValidity', agency.validity_end_date || '');
            setValue('newFromValidity', '');
            setValue('newToValidity', '');
            setAgencyList([{
                ...response.data,
                label: response.data.agency_name,
                value: response.data.id,
            }]);
            setValue('agencyName', response.data.id)
        } catch (error) {
            console.error("Failed to fetch agency by ID:", error);
        } finally {
            setIsLoading(false);
        }
    };


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
            console.error("Failed to get agency:", error.data[Object.keys(error.data)[0]]);
        } finally {
            setIsLoading(false);
        }

    }

    const selectedAgency = watch('agencyName');

    useEffect(() => {
        if (selectedAgency) {
            const agency = agencyList.find((item) => item.id === Number(selectedAgency));
            if (agency) {
                setValue('agencyId', agency.id || '');
                setValue('agencyName', agency.id || '');
                setValue('currentFromValidity', agency.validity_start_date || '');
                setValue('currentToValidity', agency.validity_end_date || '');
                setValue('newFromValidity', agency.validity_start_date || '');
                setValue('newToValidity', '');
            }
        }
    }, [selectedAgency, agencyList]);

    console.log(errors)
    return (
        <AuthUserReusableCode pageTitle="Extend Validity" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* <CustomizedSelectInputWithLabel
                        label="Circle"
                        errors={errors.circle}
                        containerClass=""
                        placeholder="Select Circle Type"
                        list={[]}
                        {...register('circle')}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Division"
                        errors={errors.division}
                        containerClass=""
                        placeholder="Select Division"
                        list={[]}
                        {...register('division')}
                    /> */}
                    <CustomizedSelectInputWithLabel
                        label="Agency Name"
                        errors={errors.agencyName}
                        containerClass="col-span-2"
                        placeholder="Select Agency Name"
                        list={agencyList}
                        required
                        {...register('agencyName')}
                    />
                    <CustomizedInputWithLabel
                        label="Agency ID"
                        errors={errors.agencyId}
                        containerClass="col-span-2"
                        placeholder="Agency ID"
                        {...register('agencyId')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Current Validity From"
                        errors={errors.currentFromValidity}
                        containerClass=""
                        placeholder="Current Validity From"
                        {...register('currentFromValidity')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Current Validity To"
                        errors={errors.currentToValidity}
                        containerClass=""
                        placeholder="Current Validity To"
                        {...register('currentToValidity')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Validity From Date"
                        errors={errors.newFromValidity}
                        containerClass=""
                        placeholder="Validity Date"
                        disabled
                        {...register('newFromValidity')}
                    />
                    <CustomizedInputWithLabel
                        label="Validity To Date"
                        errors={errors.newToValidity}
                        containerClass=""
                        placeholder="Choose Validity Date"
                        type="date"
                        required
                        {...register('newToValidity')}
                    />
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

export default ExtendValidity;
