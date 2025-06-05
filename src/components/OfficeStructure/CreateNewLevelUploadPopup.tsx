'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fileUploadSchema } from '@/lib/zod';
import { uploadOfficeStructureLevel } from '@/app/api-calls/admin/api';

interface CreateNewLevelUploadPopupProps {
    fetchData: () => void;
}

type FormData = z.infer<typeof fileUploadSchema>;

const CreateNewLevelUploadPopup: React.FC<CreateNewLevelUploadPopupProps> = ({ fetchData }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(fileUploadSchema),
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const isCSV =
            file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');

        if (!isCSV) {
            toast.error('Only .csv files are allowed');
            setValue('file', '');
            setFileName('');
            return;
        }

        setValue('file', file);
        setFileName(file.name);
    };

    const handleFormSubmit = async (data: FormData) => {

        const formData = new FormData();
        formData.append('file', data.file);

        setIsUploading(true);
        try {
            const response = await uploadOfficeStructureLevel(formData)

            toast.success(response.message || 'File uploaded successfully');
            setFileName(null);
            setValue('file', null as any);
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error('File upload failed:', error);
            toast.error('Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <Button variant="default" onClick={() => setIsDialogOpen(true)}>
                Upload File
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isUploading && setIsDialogOpen(isOpen)}>
                <DialogContent>
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Upload File</DialogTitle>
                        </DialogHeader>
                        <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                            <input
                                type="file"
                                accept=".csv"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                                <Upload size={24} />
                                <p className="text-sm text-gray-600">
                                    Drag & drop files or <span className="text-blue-500">Browse</span>
                                </p>
                                <p className="text-xs text-gray-400">Only CSV format is supported, size limit 5MB</p>
                            </label>
                            {fileName && <p className="text-sm text-green-500 mt-2">{fileName}</p>}
                        </div>
                        {/* {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>} */}
                        <DialogFooter>
                            <div className="flex justify-end space-x-4">
                                <DialogClose asChild>
                                    <Button variant="outline" disabled={isUploading}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" variant="default" disabled={isUploading}>
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload'
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

export default CreateNewLevelUploadPopup;
