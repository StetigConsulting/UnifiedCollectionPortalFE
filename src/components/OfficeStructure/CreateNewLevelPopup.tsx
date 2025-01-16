'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';

const createNewLevelSchema = z.object({
    levelName: z.string().nonempty({ message: 'Level name is required' }),
    file: z
        .instanceof(File)
        .refine((file) => file.type === 'text/csv', { message: 'Only CSV files are allowed' })
        .refine((file) => file.size <= 5 * 1024 * 1024, { message: 'File size must be under 5MB' }),
});

type FormData = z.infer<typeof createNewLevelSchema>;

const CreateNewLevelPopup = () => {
    const [levelCount, setLevelCount] = useState(1);
    const [fileName, setFileName] = useState(null);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(createNewLevelSchema),
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setValue('file', file);
            setFileName(file.name);
        }
    };

    const incrementLevel = () => setLevelCount((prev) => prev + 1);
    const decrementLevel = () => setLevelCount((prev) => Math.max(prev - 1, 1));

    return (
        <Dialog>
            <DialogTrigger>
                {/* <Button variant="default" className="text-white"> */}
                Create New Level
                {/* </Button> */}
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <Input
                        type="text"
                        placeholder={`Enter Level ${levelCount} name`}
                        {...register('levelName')}
                        className="w-full"
                    />
                    {errors.levelName && <p className="text-red-500 text-sm">{errors.levelName.message}</p>}
                    <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                        <input
                            type="file"
                            accept=".csv"
                            id="file-upload"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center cursor-pointer"
                        >
                            <Upload size={24} />
                            <p className="text-sm text-gray-600">
                                Drag & drop files or <span className="text-blue-500">Browse</span>
                            </p>
                            <p className="text-xs text-gray-400">Only CSV format is supported, size limit 5MB</p>
                        </label>
                        {fileName && <p className="text-sm text-green-500 mt-2">{fileName}</p>}
                    </div>
                    {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>}


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
