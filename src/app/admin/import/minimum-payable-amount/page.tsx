'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { toast } from 'sonner';

const MinimumPayableAmount = () => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files ? e.target.files[0] : null;
        if (uploadedFile) {
            setFile(uploadedFile);
            toast.success('File uploaded successfully!');
        }
    };

    const handleSubmit = () => {
        if (file) {
            console.log('File ready for submission:', file);
            toast.success('File submitted successfully!');
        } else {
            toast.error('Please upload a file first!');
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Minimum Payable Amount">
            <div className="flex flex-col items-center justify-center space-y-6">
                <div className="text-center text-gray-700">
                    {!file ? (
                        <div>
                            <p>No document is uploaded, try uploading using the upload button</p>
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                className="mt-4"
                            />
                        </div>
                    ) : (
                        <div>
                            <p>Uploaded: {file.name}</p>
                            <p className="text-blue-500">{file.type}</p>
                        </div>
                    )}
                </div>
                <div className="text-center mt-6 space-x-4">
                    <Button
                        variant="outline"
                        onClick={handleSubmit}
                        disabled={!file}
                    >
                        Upload
                    </Button>
                    <Button variant="default" onClick={() => setFile(null)}>
                        Clear
                    </Button>
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default MinimumPayableAmount;
