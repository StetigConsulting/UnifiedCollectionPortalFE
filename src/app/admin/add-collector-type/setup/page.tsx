'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addCollectorTypeSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import CustomizedMultipleSelectInputWithLabelString from "@/components/CustomizedMultipleSelectInputWithLabelString"; // Multi-select component
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { getAllGlobalCollectorTypes, getCollectorTypes } from "@/app/api-calls/agency/api";
import { CollectorTypeUpdateInterface } from "@/lib/interface";
import { useSession } from "next-auth/react";
import CustomizedMultipleSelectInputWithLabelNumber from "@/components/CustomizedMultipleSelectInputWithLabelNumber";
import { urlsListWithTitle } from "@/lib/utils";
import { updateCollectorType } from "@/app/api-calls/admin/api";

type FormData = z.infer<typeof addCollectorTypeSchema>;

const AddCollectorTypeSetup = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const { data: session } = useSession()

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(addCollectorTypeSchema),
    });

    const formData = watch();

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            let payload: CollectorTypeUpdateInterface = {
                discom_id: session.user.discomId,
                collector_types: data.collectorType
            }
            const response = await updateCollectorType(payload);
            toast.success('Collector Type Updated Successfully!');
            router.push(urlsListWithTitle.collectorType.url);
        } catch (error) {
            toast.error('Error: ' + (error.error));
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const [collectorTypeList, setCollectorTypeList] = useState()

    const getPicklist = async () => {
        try {
            setIsLoading(true)
            const response = await getAllGlobalCollectorTypes();
            setCollectorTypeList(response.data?.map((item) => ({ label: item.name, value: item.id })));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false)
        }
    }

    const fetchNonEnergyType = async () => {
        setIsLoading(true);
        try {
            const response = await getCollectorTypes();
            setValue('collectorType', response.data.map((item => item?.id)));
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getPicklist();
        fetchNonEnergyType()
    }, [])

    return (
        <AuthUserReusableCode pageTitle="Add Collector Type" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-2">
                <div className="space-y-2">
                    <CustomizedMultipleSelectInputWithLabelNumber
                        label="Collector Type"
                        errors={errors.collectorType}
                        required={true}
                        list={collectorTypeList}
                        placeholder="Select Collector Type"
                        value={watch('collectorType') || []}
                        onChange={(selectedValues) => setValue('collectorType', selectedValues)}
                        multi={true}
                    />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <Button variant="outline" type="button" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Save"}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default AddCollectorTypeSetup;
