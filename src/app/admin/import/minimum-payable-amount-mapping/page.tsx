'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Download, Trash2, Upload, X, CloudUpload } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SuccessErrorModal from '@/components/SuccessErrorModal';

const ConsumerMinimumPayableMapping: React.FC = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDownload = () => {
        console.log("Download triggered");
    };

    const handleDelete = () => {
        console.log("Delete triggered");
    };

    const handleUploadClick = () => {
        setIsUploadModalOpen(true);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!selectedFile) {
            setIsUploadModalOpen(false);
            setIsErrorModalOpen(true);
            return;
        }
        console.log("Uploading:", selectedFile.name);
        setIsUploadModalOpen(false);
        setIsSuccessModalOpen(true);
        setTimeout(() => {
            setIsSuccessModalOpen(false);
        }, 2000);
    };

    return (
        <AuthUserReusableCode pageTitle="Consumer To Minimum Payable Amount Mapping">
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
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setIsUploadModalOpen(false)}>
                            <X className="h-5 w-5" />
                        </button>
                    </DialogHeader>

                    <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-md">
                        <CloudUpload className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-500">Drag & drop files or <label htmlFor="fileUpload" className="text-blue-600 cursor-pointer underline">Browse</label></p>
                        <input type="file" id="fileUpload" className="hidden" onChange={handleFileSelect} accept=".xls,.xlsx" />
                        <p className="text-xs text-gray-500 mt-2">
                            Mandatory to upload data in proper format. Please refer to the "Download" button for guidelines.
                        </p>
                    </div>

                    {selectedFile && (
                        <p className="mt-2 text-center text-sm text-green-600">
                            Selected File: {selectedFile.name}
                        </p>
                    )}

                    <DialogFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                        <Button variant="default" onClick={handleUpload} disabled={!selectedFile}>Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SuccessErrorModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} message="Data Upload Successfully!" type="success" />
            <SuccessErrorModal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} message="Upload Failed! Please select a file." type="error" />
        </AuthUserReusableCode>
    );
};

export default ConsumerMinimumPayableMapping;
