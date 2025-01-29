'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentModeSchema } from '@/lib/zod'; // Import the schema
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomizedMultipleSelectInputWithLabelString from '@/components/CustomizedMultipleSelectInputWithLabelString'; // Import the component for multi-select
import AuthUserReusableCode from '@/components/AuthUserReusableCode'; // Import AuthUserReusableCode

const PaymentConfiguration = () => {
    const [isSetupModalVisible, setIsSetupModalVisible] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(paymentModeSchema),
    });

    const formData = watch();

    const handleSubmitForm = (data) => {
        console.log('Form Data:', data);
    };

    const handleSetupPaymentMode = () => {
        setIsSetupModalVisible(true);
    };

    const paymentModeOptions = [
        { label: 'Cash', value: 'Cash' },
        { label: 'Cheque', value: 'Cheque' },
        { label: 'DD', value: 'DD' },
        { label: 'Activate', value: 'Activate' }
    ];

    return (
        <AuthUserReusableCode pageTitle="Payment Configuration">
            <div className='p-4'>
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="default" size="lg" className="w-full" onClick={handleSetupPaymentMode}>
                        Setup Payment Mode
                    </Button>
                    <Button variant="default" size="lg" className="w-full">
                        Deactivate Payment Mode
                    </Button>
                </div>
                {isSetupModalVisible && (
                    <div className='mt-8'>
                        <form onSubmit={handleSubmit(handleSubmitForm)}>
                            <CustomizedMultipleSelectInputWithLabelString
                                label="Select Payment mode:"
                                errors={errors.selectedPaymentModes}
                                required={true}
                                list={paymentModeOptions}
                                placeholder="Select Payment Modes"
                                value={watch('selectedPaymentModes') || []}
                                onChange={(selectedValues) => setValue('selectedPaymentModes', selectedValues)}
                                multi={true} // This will allow multi-select functionality
                            />

                            <div className="flex justify-end space-x-4 mt-6">
                                <Button variant="outline" type="button" onClick={() => setIsSetupModalVisible(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="default">
                                    Save
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthUserReusableCode>
    );
};

export default PaymentConfiguration;
