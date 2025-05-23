'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedMultipleSelectInputWithLabelString from '@/components/CustomizedMultipleSelectInputWithLabelString';
import { AddModeOfPaymentFormData, addModeOfPaymentSchema } from '@/lib/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { PaymentModeUpdateInterface } from '@/lib/interface';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { updatePaymentMode } from '@/app/api-calls/admin/api';
import { getErrorMessage, urlsListWithTitle } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getAllGlobalPaymentMode, getAllPaymentModes } from '@/app/api-calls/department/api';
import { Loader2, Trash2 } from 'lucide-react';
import SuccessErrorModal from '@/components/SuccessErrorModal';
import ReactTable from '@/components/ReactTable';
import NormalReactTable from '@/components/NormalReactTable';
import AlertPopup from '@/components/Agency/ViewAgency/AlertPopup';
import AlertPopupWithState from '@/components/Agency/ViewAgency/AlertPopupWithState';

const AddPaymentConfiguration: React.FC = () => {
    const router = useRouter();
    const { data: session } = useSession();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<AddModeOfPaymentFormData>({
        resolver: zodResolver(addModeOfPaymentSchema),
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [paymentModesList, setPaymentModesList] = useState([])

    const [isErrorModalOpened, setIsErrorModalOpened] = useState(false);
    const [errorMessage, setErrorMessage] = useState('')
    const [errorValidationIssues, setErrorValidationIssues] = useState([])

    const onSubmit = async (data: AddModeOfPaymentFormData) => {
        setIsSubmitting(true);
        try {
            let payload: PaymentModeUpdateInterface = {
                discom_id: session.user.discomId,
                payment_modes: data.paymentModes
            }
            const response = await updatePaymentMode(payload);
            toast.success('Mode of Payment Updated Successfully!');
            router.push(urlsListWithTitle.modeOfPayment.url);
        } catch (error) {
            const flattenedErrors = error?.data?.validation_errors?.flatMap(item => {
                return [
                    ...item.active_entities.map(entity => ({
                        ...entity,
                        entity: item.entity,
                        status: "Active"
                    })),
                    ...item.in_active_entities.map(entity => ({
                        ...entity,
                        entity: item.entity,
                        status: "Inactive"
                    }))
                ];
            });
            // toast.error('Error: ' + (error.error));
            setIsErrorModalOpened(true)
            setErrorMessage(error.error)
            console.log(flattenedErrors);
            setErrorValidationIssues(flattenedErrors);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPicklist = async () => {
        try {
            setIsLoading(true)
            const response = await getAllGlobalPaymentMode();
            setPaymentModesList(response.data
                ?.filter((ite) => ite.mode_type == "Collection")
                .map((item) => ({ label: item.mode_name, value: item.id })));
            // setValue('paymentModes', response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false)
        }
    }

    const fetchPaymentMethods = async () => {
        setIsLoading(true);
        try {
            const response = await getAllPaymentModes();
            setValue('paymentModes', response.data.map((item => item?.id)));
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getPicklist()
        fetchPaymentMethods()
    }, [])

    const columns = [
        { label: 'Entity', key: 'entity', sortable: true },
        { label: 'Agency ID', key: 'agency_id', sortable: true },
        { label: 'Agency Name', key: 'agency_name', sortable: true },
        { label: 'Agent ID', key: 'id', sortable: true },
        { label: 'Agent Name', key: 'agent_name', sortable: true },
        { label: 'Payment Modes', key: 'payment_modes', sortable: true },
        { label: 'Status', key: 'status', sortable: true },
    ];

    const [openConfirmationPopup, setOpenConfirmationPopup] = useState(false);

    return (
        <AuthUserReusableCode pageTitle="Mode Of Payment" isLoading={isLoading || isSubmitting}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <CustomizedMultipleSelectInputWithLabelNumber
                    label="Select Payment mode"
                    errors={errors.paymentModes}
                    placeholder="Select Payment mode"
                    list={paymentModesList}
                    required
                    value={watch('paymentModes') || []}
                    multi
                    onChange={(selectedValues) => setValue('paymentModes', selectedValues)}
                />
                <div className="flex justify-end gap-4 mt-4">
                    <Button type="button" variant="outline" onClick={() => { router.push(urlsListWithTitle.modeOfPayment.url) }}>Cancel</Button>
                    <AlertPopupWithState isOpen={openConfirmationPopup} setIsOpen={setOpenConfirmationPopup}
                        triggerCode={<Button variant="default" disabled={isSubmitting}>
                            {isSubmitting ? <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </> : "Save"}
                        </Button>} handleContinue={handleSubmit(onSubmit)}
                        title=''
                        description='This action may affect the current payment methods for agencies and agents. Do you wish to proceed?'
                        continueButtonText='Yes'
                    />
                </div>
            </form>
            <SuccessErrorModal isOpen={isErrorModalOpened} onClose={() => setIsErrorModalOpened(false)}
                message={errorMessage} type="error"
                errorTable={<NormalReactTable
                    data={errorValidationIssues}
                    columns={columns}
                />}
            />
        </AuthUserReusableCode>
    );
};

export default AddPaymentConfiguration;
