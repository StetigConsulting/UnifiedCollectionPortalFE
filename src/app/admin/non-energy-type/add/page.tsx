'use client';

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nonEnergyTypeSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import CustomizedMultipleSelectInputWithLabelString from "@/components/CustomizedMultipleSelectInputWithLabelString";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { getAllGlobalNonEnergyTypes, getAllNonEnergyTypes } from "@/app/api-calls/department/api";
import { urlsListWithTitle } from "@/lib/utils";
import { updateNonEnergyType } from "@/app/api-calls/admin/api";
import { NonEnergyTypeUpdateInterface } from "@/lib/interface";
import { useSession } from "next-auth/react";
import CustomizedMultipleSelectInputWithLabelNumber from "@/components/CustomizedMultipleSelectInputWithLabelNumber";

type FormData = z.infer<typeof nonEnergyTypeSchema>;

const NonEnergyType = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(nonEnergyTypeSchema),
    });

    const formData = watch();

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            let payload: NonEnergyTypeUpdateInterface = {
                discom_id: session.user.discomId,
                non_energy_types: data.nonEnergyType
            }
            const response = await updateNonEnergyType(payload);
            toast.success('Payment Modes Updated Successfully!');
            router.push(urlsListWithTitle.nonEnergyTypeTable.url);
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

    const [nonEnergyTypeList, setNonEnergyTypeList] = useState([]);

    const getPicklist = async () => {
        try {
            setIsLoading(true)
            const response = await getAllGlobalNonEnergyTypes();
            setNonEnergyTypeList(response.data?.map((item) => ({ label: item.type_name, value: item.id })));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false)
        }
    }

    const fetchNonEnergyType = async () => {
        setIsLoading(true);
        try {
            const response = await getAllNonEnergyTypes();
            setValue('nonEnergyType', response.data.map((item => item?.id)));
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

    console.log(errors)

    return (
        <AuthUserReusableCode pageTitle="Non Energy Type" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-2">
                <div className="space-y-2">
                    <CustomizedMultipleSelectInputWithLabelNumber
                        label="Non Energy Type"
                        placeholder="Select reasons"
                        errors={errors.nonEnergyType}
                        required={true}
                        list={nonEnergyTypeList}
                        value={watch('nonEnergyType') || []}
                        onChange={(selectedValues) => setValue('nonEnergyType', selectedValues)}
                        multi={true}
                    />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <Button variant="outline" type="button" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default NonEnergyType;
