'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Download, Trash2, Upload, X, CloudUpload, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SuccessErrorModal from '@/components/SuccessErrorModal';
import { deleteMinimumPayableAmount, downloadMinimumPayableAmount, uploadMinimumPayableAmount } from '@/app/api-calls/admin/api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

const ConsumerMinimumPayableMapping: React.FC = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false)

    const handleDownload = async () => {
        try {
            setIsLoading(false)
            const response = await downloadMinimumPayableAmount()

            const contentDisposition = response.headers["content-disposition"];
            let filename = "ConsumerWiseMinPayableAmount";

            if (contentDisposition) {
                const matches = contentDisposition.match(/filename="(.+)"/);
                if (matches && matches.length > 1) {
                    filename = matches[1];
                }
            }

            const contentType = response.headers["content-disposition"];
            console.log(contentType)
            let extension = "csv";

            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true)
            const response = await deleteMinimumPayableAmount()
            toast.success(response.message)
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    };

    const handleUploadClick = () => {
        setIsUploadModalOpen(true);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };


    const handleUpload = async () => {
        if (!selectedFile) {
            setIsUploadModalOpen(false);
            setIsErrorModalOpen(true);
            return;
        }
        try {
            setIsLoading(true);
            setIsUploading(true)
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await uploadMinimumPayableAmount(formData);
            toast.success(response.message)
            setIsUploadModalOpen(false);
            setIsSuccessModalOpen(true);
            setSelectedFile(null)
        } catch (error) {
            setIsUploadModalOpen(false);
            setIsErrorModalOpen(true);
            setSelectedFile(null)
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
            setIsUploading(false)
        }
    };


    return (
        <AuthUserReusableCode pageTitle="Consumer To Minimum Payable Amount Mapping" isLoading={isLoading}>
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col gap-4 items-center">
                    <Button variant="default" className="w-80 py-6 text-lg flex items-center gap-2" onClick={handleDownload}>
                        <Download className="h-5 w-5" /> Download
                    </Button>

                    <Button variant="destructive" className="w-80 py-6 text-lg flex items-center gap-2" onClick={handleDelete}>
                        <Trash2 className="h-5 w-5" /> Delete
                    </Button>

                    <Button variant="success" className="w-80 py-6 text-lg flex items-center gap-2" onClick={handleUploadClick}>
                        <Upload className="h-5 w-5" /> Upload New Document
                    </Button>
                </div>
            </div>

            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Minimum Payable Amount</DialogTitle>
                    </DialogHeader>

                    <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-md">
                        <CloudUpload className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-500">Drag & drop files or <label htmlFor="fileUpload" className="text-blue-600 cursor-pointer underline">Browse</label></p>
                        <input type="file" id="fileUpload" className="hidden" onChange={handleFileSelect} accept=".xls,.xlsx,.csv" />
                        <p className="text-xs text-gray-500 mt-2">
                            Mandatory to Upload Data in proper format, please refer the 'Download Excel Format / Existing Data' button to know more
                        </p>
                    </div>

                    {selectedFile && (
                        <p className="mt-2 text-center text-sm text-green-600">
                            Selected File: {selectedFile.name}
                        </p>
                    )}

                    <DialogFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                        <Button variant="default" onClick={handleUpload} disabled={!selectedFile || isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                </>
                            ) : (
                                'Upload'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SuccessErrorModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}
                message="Data Upload Successfully!" type="success" />
            <SuccessErrorModal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}
                message="Error occurred while uploading data" type="error" />
        </AuthUserReusableCode>
    );
};

export default ConsumerMinimumPayableMapping;
