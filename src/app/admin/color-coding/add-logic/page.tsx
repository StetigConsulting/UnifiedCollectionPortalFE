'use client';

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { colorCodingLogicSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";

type FormData = z.infer<typeof colorCodingLogicSchema>;

const ColorCodingLogic = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(colorCodingLogicSchema),
    });

    const formData = watch();

    const [colorLogicEntries, setColorLogicEntries] = useState([
        {
            value1Type: "Days",
            days: "",
            value2Type: "Date",
            date: "",
            backgroundColor: "#ffffff",
            fontColor: "#000000",
            fontType: "Actual",
        }
    ]);

    const onSubmit = async (data: FormData) => {
        try {
            setIsSubmitting(true);
            toast.success("Form submitted successfully!");
        } catch (error) {
            toast.error("Failed to submit the form.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const addMoreLogic = () => {
        setColorLogicEntries([
            ...colorLogicEntries,
            {
                value1Type: "Days",
                days: "",
                value2Type: "Date",
                date: "",
                backgroundColor: "#ffffff",
                fontColor: "#000000",
                fontType: "Actual",
            }
        ]);
    };

    const handleBackgroundColorChange = (index: number, color: string) => {
        const newEntries = [...colorLogicEntries];
        newEntries[index].backgroundColor = color;
        setColorLogicEntries(newEntries);
    };

    const handleFontColorChange = (index: number, color: string) => {
        const newEntries = [...colorLogicEntries];
        newEntries[index].fontColor = color;
        setColorLogicEntries(newEntries);
    };

    return (
        <AuthUserReusableCode pageTitle="Color Coding Logic">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {colorLogicEntries.map((logic, index) => (
                    <div key={index} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <CustomizedSelectInputWithLabel
                                label="Value 1 Type"
                                list={[{ label: "Days", value: "Days" }, { label: "Date", value: "Date" }]}
                                {...register(`colorLogicEntries.${index}.value1Type`)}
                                value={logic.value1Type}
                            />

                            <CustomizedInputWithLabel
                                label="Days"
                                type="number"
                                {...register(`colorLogicEntries.${index}.days`)}
                                value={logic.days}
                            />

                            <CustomizedSelectInputWithLabel
                                label="Value 2 Type"
                                list={[{ label: "Date", value: "Date" }, { label: "Days", value: "Days" }]}
                                {...register(`colorLogicEntries.${index}.value2Type`)}
                                value={logic.value2Type}
                            />

                            <CustomizedInputWithLabel
                                label="Date"
                                type="date"
                                {...register(`colorLogicEntries.${index}.date`)}
                                value={logic.date}
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Select Background Color</label>
                                <div className="flex items-center space-x-2">
                                    <div className="w-full">
                                        <CustomizedInputWithLabel type="text"
                                            value={logic.backgroundColor}
                                            readOnly />
                                    </div>
                                    <input
                                        type="color"
                                        value={logic.backgroundColor}
                                        onChange={(e) => handleBackgroundColorChange(index, e.target.value)}
                                        className="w-10 h-10 border rounded-full cursor-pointer"
                                    />
                                </div>
                            </div>

                            <CustomizedSelectInputWithLabel
                                label="Select Font Type"
                                list={[{ label: "Actual", value: "Actual" }, { label: "Italic", value: "Italic" }]}
                                {...register(`colorLogicEntries.${index}.fontType`)}
                                value={logic.fontType}
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Select Font Color</label>
                                <div className="flex items-center space-x-2">
                                    {/* <input
                                        type="text"
                                        value={logic.fontColor}
                                        readOnly
                                        className="w-full h-10 text-gray-600 bg-gray-100 border rounded cursor-pointer"
                                    /> */}
                                    <div className="w-full">
                                        <CustomizedInputWithLabel type="text"
                                            value={logic.fontColor}
                                            readOnly />
                                    </div>
                                    <input
                                        type="color"
                                        value={logic.fontColor}
                                        onChange={(e) => handleFontColorChange(index, e.target.value)}
                                        className="w-10 h-10 border rounded-full cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="mt-6 text-end space-x-4">
                    <Button variant="outline" type="button" onClick={addMoreLogic}>
                        + Add More
                    </Button>
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

export default ColorCodingLogic;
