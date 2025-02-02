'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addCollectorTypeSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import CustomizedMultipleSelectInputWithLabelString from "@/components/CustomizedMultipleSelectInputWithLabelString"; // Multi-select component
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";

type FormData = z.infer<typeof addCollectorTypeSchema>;

const AddCollectorType = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(addCollectorTypeSchema),
    });

    const formData = watch();

    const onSubmit = async (data: FormData) => {
        console.log("Form Data:", data);
        try {
            setIsSubmitting(true);
            toast.success("Collector Type saved successfully!");
        } catch (error) {
            toast.error("Failed to save Collector Type.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const collectorTypes = [
        { label: "Type 1", value: "Type 1" },
        { label: "Type 2", value: "Type 2" },
        { label: "Type 3", value: "Type 3" },
    ];

    return (
        <AuthUserReusableCode pageTitle="Add Collector Type">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <CustomizedMultipleSelectInputWithLabelString
                        label="Collector Type"
                        errors={errors.collectorType}
                        required={true}
                        list={collectorTypes}
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

export default AddCollectorType;
