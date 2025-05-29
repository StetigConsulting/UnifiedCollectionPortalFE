'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdatePosFormData, updatePosSchema } from '@/lib/zod';
import { addNewsNotice, deleteNewsById, getAllNewsList, getPosSerialNoDetails, updatePosSerialNoStatus } from '@/app/api-calls/other/api';
import { toast } from 'sonner';
import { formatDate, getErrorMessage } from '@/lib/utils';
import ReactTable from '@/components/ReactTable';
import SuccessErrorModal from "@/components/SuccessErrorModal";
import AlertPopupWithState from '@/components/Agency/ViewAgency/AlertPopupWithState';
import { Loader2 } from 'lucide-react';

const NewsNoticeForm = () => {
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<UpdatePosFormData>({
        resolver: zodResolver(updatePosSchema),
    });

    const [isLoading, setIsLoading] = React.useState(false);
    const [posDeviceDetailsList, setPosDeviceDetailsList] = React.useState<any[]>([]);

    const onSubmit = async (data: UpdatePosFormData) => {
        setIsLoading(true);
        try {
            const response = await getPosSerialNoDetails(data?.deviceSerialNo);
            setValue('deviceName', response?.data?.posDeviceDetails?.[0]?.device_model)
            setValue('mid', response?.data?.posDeviceDetails?.[0]?.mid)
            setValue('tid', response?.data?.posDeviceDetails?.[0]?.tid)
            setValue('deviceStatus', response?.data?.posDeviceDetails?.[0]?.status)
            setValue('deviceSerial', response?.data?.posDeviceDetails?.[0]?.m_pos_device_serial_number)
            console.log("response", response?.data?.posDetailRegisteredDeviceList);
            setPosDeviceDetailsList(response?.data?.posDetailRegisteredDeviceList)
            setShowButton(true)
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
        }
        finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'User ID', key: 'user_id', sortable: true },
        { label: 'Mobile No.', key: 'mobile_number', sortable: true },
        { label: 'Agent Name', key: 'collector_name', sortable: true },
        { label: 'Device ID', key: 'device_id', sortable: true },
        { label: 'Device Model', key: 'model', sortable: true },
        { label: 'Device Maker', key: 'maker', sortable: true },
        { label: 'Status', key: 'status', sortable: true },
        { label: 'Last Synced Data', key: 'published_date', sortable: true },
    ], []);

    const formatData = posDeviceDetailsList.map((item) => ({
        ...item,
        published_date: formatDate(item?.last_sync_date)
    }))

    const formData = watch()

    const handleUpdateDeviceStatus = async () => {
        setIsLoading(true);
        try {
            let payload = {
                serial_number: formData?.deviceSerial
            }

            const response = await updatePosSerialNoStatus(payload);

            setPopupType('success')
            setErrorMessage('Updated Successfully!')
            setIsErrorModalOpened(true)
            reset()
            setShowButton(false)
        } catch (error) {
            console.error('Error: ' + getErrorMessage(error))
            setErrorMessage('Error: Failed to save the status!')
            setPopupType('error')
            setIsErrorModalOpened(true)
        }
        finally {
            setIsLoading(false)
        }
    }

    const [isErrorModalOpened, setIsErrorModalOpened] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [popupType, setPopupType] = useState('success');

    const [stateForConfirmationPopup, setStateForConfirmationPopup] = useState(false)
    const [showButton, setShowButton] = useState(false);

    return (
        <AuthUserReusableCode pageTitle="Update POS Serial No" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className='space-y-2 col-span-2'>
                        <div className="col-span-2">
                            <CustomizedInputWithLabel
                                label="Device Serial No."
                                type="text"
                                {...register('deviceSerialNo')}
                                errors={errors.deviceSerialNo}
                            />
                        </div>
                        <div className='text-end'>
                            <Button type='submit' disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Search'}
                            </Button>
                        </div>
                    </div>

                    <CustomizedInputWithLabel
                        label="Device Name"
                        errors={errors.deviceName}
                        {...register('deviceName')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="MID"
                        errors={errors.mid}
                        {...register('mid')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="TID"
                        errors={errors.tid}
                        {...register('tid')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Device serial"
                        errors={errors.deviceSerial}
                        {...register('deviceSerial')}
                        disabled
                    />
                </div>
            </form>
            {showButton && <>
                <div className='text-end mt-4'>
                    <AlertPopupWithState
                        triggerCode={
                            <Button
                                variant={formData?.deviceStatus === 'INACTIVE' ?
                                    "default" : 'destructive'}
                                onClick={handleSubmit((e) => { setStateForConfirmationPopup(true); })}
                            >
                                {formData?.deviceStatus === 'INACTIVE' ? 'Activate' : 'Deactivate'}
                            </Button>
                        }
                        handleContinue={handleUpdateDeviceStatus}
                        title={formData?.deviceStatus === 'INACTIVE' ?
                            "Confirm activation" : 'Confirm deactivation'}
                        description={formData?.deviceStatus === 'INACTIVE' ?
                            "Are you sure you want to activate this POS serial number?" :
                            "Are you sure you want to deactive this POS serial number?"}
                        continueButtonText="Yes"
                        isOpen={stateForConfirmationPopup}
                        setIsOpen={setStateForConfirmationPopup}
                    />
                </div>
                <div className='mt-4'>
                    <ReactTable
                        data={formatData}
                        columns={columns}
                        hideSearchAndOtherButtons
                    />
                </div>
            </>
            }
            <SuccessErrorModal isOpen={isErrorModalOpened} onClose={() => setIsErrorModalOpened(false)}
                message={errorMessage} type={popupType} />
        </AuthUserReusableCode>
    );
};

export default NewsNoticeForm;
