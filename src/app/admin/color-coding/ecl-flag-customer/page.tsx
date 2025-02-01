'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';

const ECLFlaggedCustomer = () => {
    const router = useRouter();
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            // Add your form submission logic here
            console.log('Background Color Submitted:', backgroundColor);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBackgroundColor(e.target.value);
    };

    return (
        <AuthUserReusableCode pageTitle="ECL Flagged Customer">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Background Color</label>
                    <div className="flex items-center space-x-2">
                        <div className="w-full">
                            <CustomizedInputWithLabel type="text"
                                value={backgroundColor}
                                readOnly />
                        </div>
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={handleBackgroundColorChange}
                            className="w-10 h-10 border rounded-full cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 text-right space-x-4">
                <Button variant="outline" type="button" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="default" disabled={isSubmitting} onClick={handleSubmit}>
                    {isSubmitting ? 'Submitting...' : 'Save'}
                </Button>
            </div>
        </AuthUserReusableCode>
    );
};

export default ECLFlaggedCustomer;
