"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addCollectorSchema, AddCollectorFormData } from "@/lib/zod";
// import { createCollector } from "@/app/api-calls/collector/api";  // API call for form submission
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// import { getBinders, getSubDivisions, getSections, getPermissions, getCollectionTypes, getNonEnergyTypes } from "@/app/api-calls/collector/api";
import CustomizedMultipleSelectInputWithLabelString from "@/components/CustomizedMultipleSelectInputWithLabelString";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";

// Define the types for the state data
interface SelectOption {
    value: string;
    label: string;
}

const AddCollector = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AddCollectorFormData>({
        resolver: zodResolver(addCollectorSchema),
    });

    const [isLoading, setIsLoading] = useState(false);

    const [binders, setBinders] = useState<SelectOption[]>([]);
    const [subDivisions, setSubDivisions] = useState<SelectOption[]>([]);
    const [sections, setSections] = useState<SelectOption[]>([]);
    const [permissions, setPermissions] = useState<SelectOption[]>([]);
    const [collectionTypes, setCollectionTypes] = useState<SelectOption[]>([]);
    const [nonEnergyTypes, setNonEnergyTypes] = useState<SelectOption[]>([]);

    useEffect(() => {
        // getBinders().then(setBinders);
        // getSubDivisions().then(setSubDivisions);
        // getSections().then(setSections);
        // getPermissions().then(setPermissions);
        // getCollectionTypes().then(setCollectionTypes);
        // getNonEnergyTypes().then(setNonEnergyTypes);
    }, []);

    // Handle form submission
    const onSubmit = async (data: AddCollectorFormData) => {
        try {
            // const response = await createCollector(data);
            toast.success("Collector added successfully!");
        } catch (error) {
            toast.error("Failed to add collector.");
            console.error("Error:", error);
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Add Collector" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Name"
                        placeholder="Enter Name"
                        required
                        {...register("name")}
                        errors={errors.name}
                    />
                    <CustomizedInputWithLabel
                        label="Phone Number"
                        placeholder="Enter Phone Number"
                        required
                        {...register("phoneNumber")}
                        errors={errors.phoneNumber}
                    />
                    <CustomizedInputWithLabel
                        label="Maximum Limit"
                        type="number"
                        placeholder="Enter Maximum Limit"
                        required
                        {...register("maximumLimit")}
                        errors={errors.maximumLimit}
                    />
                    <CustomizedInputWithLabel
                        label="Initial Balance"
                        type="number"
                        placeholder="Enter Initial Balance"
                        required
                        disabled
                        {...register("initialBalance")}
                        errors={errors.initialBalance}
                    />
                    <CustomizedInputWithLabel
                        label="Validity"
                        type='date'
                        required
                        {...register("validity")}
                        errors={errors.validity}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Binder"
                        list={binders}
                        required
                        {...register("binder")}
                        errors={errors.binder}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Sub Division"
                        list={subDivisions}
                        required
                        {...register("subDivision")}
                        errors={errors.subDivision}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Section"
                        list={sections}
                        required
                        {...register("section")}
                        errors={errors.section}
                    />
                    <CustomizedMultipleSelectInputWithLabelString
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
                        <CustomizedMultipleSelectInputWithLabelString
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
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default AddCollector;
