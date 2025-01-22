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
import { extendValidity, getAgenciesWithDiscom } from '@/app/api-calls/department/api';
import { testDiscom } from '@/lib/utils';
import { toast } from 'sonner';

type FormData = z.infer<typeof extendValiditySchema>;

const ExtendValidity = () => {
    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(extendValiditySchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (data: FormData) => {

        let payload = {
            id: data.agencyId,
            validity_from_date: data.newFromValidity,
            validity_to_date: data.newToValidity
        }

        try {
            setIsSubmitting(true);
            const response = await extendValidity(payload);
            toast.success("Validity extended successfully");
            console.log("API Response:", response);
            reset({
                agencyName: '',
                agencyId: null,
                currentFromValidity: '',
                currentToValidity: '',
                newFromValidity: '',
                newToValidity: '',
            });
            getAgencyList()
        } catch (error) {
            console.error("Failed to extend validity:", error.data[Object.keys(error.data)[0]]);
            let errorMessage = error.data[Object.keys(error.data)[0]]
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false);
        }
    };

    const [agencyList, setAgencyList] = useState([])

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getAgencyList()
    }, [])

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(testDiscom);
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
                setValue('currentFromValidity', agency.validity_start_date || '');
                setValue('currentToValidity', agency.validity_end_date || '');
                setValue('newFromValidity', '');
                setValue('newToValidity', '');
            }
        }
    }, [selectedAgency, agencyList, setValue]);

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
                        label="Current From Validity"
                        errors={errors.currentFromValidity}
                        containerClass=""
                        placeholder="Current From Validity"
                        {...register('currentFromValidity')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Current To Validity"
                        errors={errors.currentToValidity}
                        containerClass=""
                        placeholder="Current To Validity"
                        {...register('currentToValidity')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Validity Date"
                        errors={errors.newFromValidity}
                        containerClass=""
                        placeholder="Choose Validity Date"
                        type="date"
                        {...register('newFromValidity')}
                    />
                    <CustomizedInputWithLabel
                        label="Validity Date"
                        errors={errors.newToValidity}
                        containerClass=""
                        placeholder="Choose Validity Date"
                        type="date"
                        {...register('newToValidity')}
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default ExtendValidity;
