'use client';

import { activateSupervisorUser, deactivateSupervisorUser } from '@/app/api-calls/admin/api';
import { createSupervisor, getListOfAllSupervisor } from '@/app/api-calls/department/api';
import AlertPopup from '@/components/Agency/ViewAgency/AlertPopup';
import AuthUserReusableCode from '@/components/AuthUserReusableCode'
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import SuccessErrorModal from '@/components/SuccessErrorModal';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';
import { AddSupervisorFormData, addSupervisorSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserRoundMinus, UserRoundPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const AddNewSupervisor = () => {

    const router = useRouter();
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AddSupervisorFormData>({
        resolver: zodResolver(addSupervisorSchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isErrorModalOpened, setIsErrorModalOpened] = useState(false);
    const [modalType, setModaltype] = useState('error')
    const [errorMessage, setErrorMessage] = useState('');
    const [supervisorList, setSupervisorList] = useState<any[]>([]);

    const onSubmit = async (data: AddSupervisorFormData) => {
        setIsSubmitting(true);
        try {
            let payload = {
                "agency_id": session?.user?.userId,
                "phone": data?.mobileNumber,
                "supervisor_name": data?.supervisorName
            }
            await createSupervisor(payload)
            // toast.success('Supervisor Added Successfully');
            setModaltype('success')
            setIsErrorModalOpened(true);
            setErrorMessage('New Supervisor Created Successfully');
            getAllListOfSupervisor()
            reset();
        } catch (error: any) {
            setIsErrorModalOpened(true);
            setModaltype('error')
            setErrorMessage('Error: ' + getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        { label: 'Action', key: 'action' },
        { label: 'Agency Name', key: 'agencyName' },
        { label: 'Supervisor ID', key: 'id' },
        { label: 'Supervisor Name', key: 'supervisor_name' },
        { label: 'Mobile No.', key: 'phone' },
    ];

    console.log(errors)

    useEffect(() => {
        getAllListOfSupervisor()
    }, [])

    const getAllListOfSupervisor = async () => {
        try {
            setIsLoading(true)
            const response = await getListOfAllSupervisor(session?.user?.userId)
            setSupervisorList(response?.data)
        } catch (error) {
            console.log('Error: ' + getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const tableData = supervisorList.map((item, idx) => ({
        ...item,
        agencyName: item?.agency?.agency_name,
        action: <div className="space-x-2">
            {item?.is_active ? <AlertPopup triggerCode={<UserRoundMinus className="text-red-500 cursor-pointer" />}
                handleContinue={() => deactivateUser(item.id)}
                title='Confirm Deactivating' description='Are you sure you want to save the deactivate supervisor? Please review the details carefully before confirming.' continueButtonText='Confirm'
            /> :
                <AlertPopup triggerCode={<UserRoundPlus className="text-themeColor cursor-pointer" />}
                    handleContinue={() => activateUser(item.id)}
                    title='Confirm Activating' description='Are you sure you want to save the activate supervisor? Please review the details carefully before confirming.' continueButtonText='Confirm'
                />}
        </div>
    }))

    const activateUser = async (id: number) => {
        setIsLoading(true);
        try {
            let payload = {
                supervisor_id: id
            }
            await activateSupervisorUser(payload);
            toast.success('Supervisor activated successfully');
            await getAllListOfSupervisor();
        } catch (error) {
            toast.error('Error ', getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    const deactivateUser = async (id: number) => {
        setIsLoading(true);
        try {
            let payload = {
                supervisor_id: id
            }
            await deactivateSupervisorUser(payload);
            toast.success('Supervisor deactivated successfully');
            await getAllListOfSupervisor();
        } catch (error) {
            toast.error('Error ', getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthUserReusableCode pageTitle="Add New Supervisor" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Supervisor Name"
                        placeholder="Enter Supervisor Name"
                        {...register('supervisorName')}
                        errors={errors.supervisorName}
                    />

                    <CustomizedInputWithLabel
                        label="Mobile Number"
                        placeholder="Enter Mobile Number"
                        type="number"
                        {...register('mobileNumber')}
                        errors={errors.mobileNumber}
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => reset()}>
                        Reset
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </Button>
                </div>
            </form>

            <div className="mt-8">
                <ReactTable
                    columns={columns}
                    data={tableData}
                    hideSearchAndOtherButtons
                // isSelectable
                // onRowSelect={handleRowSelection}
                // onRowSelectButtons={
                //     getSelectedRowButton()
                // }
                // selectedRow={selectedRow}
                />
            </div>

            <SuccessErrorModal
                isOpen={isErrorModalOpened}
                onClose={() => setIsErrorModalOpened(false)}
                message={errorMessage}
                type={modalType}
            />
        </AuthUserReusableCode>
    )
}

export default AddNewSupervisor