'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNewLevelSchema } from '@/lib/zod';
import { toast } from 'sonner';

type FormData = z.infer<typeof createNewLevelSchema>;

const CreateNewLevelPopup = () => {
    const [levelCount, setLevelCount] = useState(1);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(createNewLevelSchema),
    });

    const incrementLevel = () => setLevelCount((prev) => prev + 1);
    const decrementLevel = () => setLevelCount((prev) => Math.max(prev - 1, 1));

    const handleFormSubmit = async (formData: FormData) => {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/office-structure-levels/`;

        const payload = {
            user_id: 6,
            discom_id: 5667,
            level: levelCount,
            level_name: formData.levelName,
            level_type: formData.levelType,
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('Level created successfully:', responseData);

            setValue('levelName', '');
            setValue('levelType', '');
            toast.success('Level created successfully');
        } catch (error) {
            // console.error('Failed to create level:', error);
            toast.error('Failed to create level. Please try again.');
        }
    };

    return (
        <Dialog>
            <DialogTrigger>
                Create New Level
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Level {levelCount}</span>
                                <div className="flex space-x-2">
                                    <Button type="button" variant="outline" onClick={decrementLevel}>
                                        -
                                    </Button>
                                    <Button type="button" variant="outline" onClick={incrementLevel}>
                                        +
                                    </Button>
                                </div>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <CustomizedInputWithLabel
                        label={`Enter Level ${levelCount} Name`}
                        placeholder={`Enter Level ${levelCount} Name`}
                        errors={errors.levelName}
                        {...register('levelName')}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Level Type"
                        placeholder="Select Level Type"
                        errors={errors.levelType}
                        list={[
                            { value: 'MAIN', label: 'MAIN' },
                            { value: 'PSEUDO', label: 'PSEUDO' },
                        ]}
                        {...register('levelType')}
                    />
                    <DialogFooter>
                        <div className="flex justify-end space-x-4">
                            <DialogClose asChild>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" variant="default">
                                Save
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateNewLevelPopup;
