'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNewLevelSchema } from '@/lib/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Session } from 'next-auth';
import { createOfficeStructureLevel } from '@/app/api-calls/admin/api';
import { getErrorMessage } from '@/lib/utils';

interface CreateNewLevelPopupProps {
    fetchData: () => void;
    currentLevel: number;
    session: Session
}

type FormData = z.infer<typeof createNewLevelSchema>;

const CreateNewLevelPopup: React.FC<CreateNewLevelPopupProps> = ({ fetchData, currentLevel, session }) => {

    const currentUserId = session?.user?.userId

    const [levelCount, setLevelCount] = useState<number>(1);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

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

        const payload = {
            user_id: currentUserId,
            discom_id: session?.user?.discomId,
            level: currentLevel,
            level_name: formData.levelName,
            level_type: formData.levelType,
        };

        setIsSaving(true);
        try {
            const response = await createOfficeStructureLevel(payload)

            toast.success('Level created successfully');
            setValue('levelName', '');
            setValue('levelType', '');
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Error: ', getErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Button variant="default" onClick={() => setIsDialogOpen(true)}>
                Create New Level
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isSaving && setIsDialogOpen(isOpen)}>
                <DialogContent>
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Create Level {currentLevel}</DialogTitle>
                        </DialogHeader>
                        {/* <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Level {currentLevel}</span>
                            <div className="flex space-x-2">
                                <Button type="button" variant="outline" onClick={decrementLevel}>
                                    -
                                </Button>
                                <Button type="button" variant="outline" onClick={incrementLevel}>
                                    +
                                </Button>
                            </div>
                        </div> */}
                        <CustomizedInputWithLabel
                            label={`Level ${currentLevel} Name`}
                            placeholder={`Enter Level ${currentLevel} Name`}
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
                                    <Button variant="outline" type="button" disabled={isSaving}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" variant="default" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CreateNewLevelPopup;
