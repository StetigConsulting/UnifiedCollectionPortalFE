'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { binderMappingSchema, BinderMappingFormData } from '@/lib/zod';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { getAgentByPhoneNumber, getLevels, getPseudoLevel } from '@/app/api-calls/department/api';
import { getErrorMessage } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { getListOfAvailableBindersByAgentId, updateListOfBinder } from '@/app/api-calls/agency/api';
import { Loader2 } from 'lucide-react';

const BinderMapping = () => {
    const { data: session } = useSession()
    const { register, handleSubmit, formState: { errors }, setValue, clearErrors, watch, setError, reset } = useForm<BinderMappingFormData>({
        resolver: zodResolver(binderMappingSchema),
        defaultValues: {
            binder: [],
            allocatedBinder: []
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [workingLevelList, setWorkingLevelList] = useState([]);
    const [listOfAvailableBinders, setListOfAvailableBinders] = useState([]);
    const [listOfOtherBinders, setListOfOtherBinders] = useState([])

    const [pseudoLevelData, setPseudoLevelData] = useState(null)

    useEffect(() => {

        getLevels(session?.user?.discomId).then((res) => {
            setWorkingLevelList(
                res?.data
                    ?.filter((ite) => ite.levelType == "MAIN")
                    ?.map((ite) => {
                        return {
                            value: ite.id,
                            label: ite.levelName,
                        };
                    })
            );
        })

        getPseudoLevel(session?.user?.discomId).then((res) => {
            setPseudoLevelData(res?.data?.levelName)
        })

    }, []);


    const onSubmit = async (data: BinderMappingFormData) => {
        setIsSubmitting(true)
        try {
            let payload = {
                "agent_id": data.agentId,
                "pseudo_office_structure": data.binder
            }
            await updateListOfBinder(payload);
            toast.success('Binder Mapping added successfully!');
            reset()
            setShowRestFields(false)
            setListOfAvailableBinders([])
            setListOfOtherBinders([])
        } catch (error) {
            let errorMessage = getErrorMessage(error);
            toast.error('Error: ' + errorMessage);
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false)
        }
    };

    const [showRestFields, setShowRestFields] = useState(false);

    const handleGetAgentData = async () => {
        const mobileNumber = Number(watch('collectorMobile'));
        if (!isNaN(mobileNumber) && mobileNumber.toString().length === 10) {
            try {
                setIsLoading(true);
                const response = await getAgentByPhoneNumber(mobileNumber);
                if (response.data.collector_role === 'Counter Collector') {
                    throw new Error('Counter Collector cannot be assigned binders.')
                }
                setValue('agencyName', response.data.agent_name)
                setValue('agentId', response.data.id)
                setValue('agentMobileNumber', response.data.primary_phone || '');
                setValue('division', response.data.working_level)
                setShowRestFields(true)
                getListOfAllBinders(response.data.id)
            } catch (error) {
                console.log(error.message);
                let errorMessage = getErrorMessage(error);
                toast.error('Error: ' + errorMessage || error.message)
                setShowRestFields(false)
            } finally {
                setIsLoading(false);
            }
        } else {
            setError("collectorMobile", {
                type: "manual",
                message: "Please enter a valid 10-digit mobile number.",
            });
            return;
        }
    }

    const getListOfAllBinders = async (id: number) => {
        try {
            const response = await getListOfAvailableBindersByAgentId(id);
            let allocated = response.data.agent_allocated_pseudo_office_structure

            const officeStructureIds = allocated.map(item => item.office_structure_id);
            setValue('binder', officeStructureIds)

            let unallocated = response.data.unallocated_pseudo_office_structure

            let binderList = [...unallocated]

            setListOfAvailableBinders(binderList)

            setListOfOtherBinders(response.data.other_agent_allocated_pseudo_office_structure)
        } catch (error) {
            console.error(error)
        }

    }

    const selectedBinder = watch('binder') || [];

    const handleBinderChange = (officeStructureId: number) => {
        console.log(officeStructureId, selectedBinder)
        let updatedSelection = [...selectedBinder];

        if (updatedSelection.includes(officeStructureId)) {
            updatedSelection = updatedSelection.filter(id => id !== officeStructureId);
        } else {
            updatedSelection.push(officeStructureId);
        }
        console.log(officeStructureId, updatedSelection)

        setValue('binder', updatedSelection, { shouldValidate: true });
    };


    console.log(selectedBinder)
    return (
        <AuthUserReusableCode pageTitle="Pseudo Level Mapping" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className='space-y-2 col-span-2'>
                        <div className="col-span-2">
                            <CustomizedInputWithLabel
                                label="Agent Mobile"
                                type="text"
                                {...register('collectorMobile', { valueAsNumber: true })}
                                onChange={() => {
                                    clearErrors("collectorMobile")
                                    setValue('agencyName', '')
                                    setValue('agentId', null)
                                    setValue('agentMobileNumber', '')
                                    setValue('division', null)
                                    setListOfAvailableBinders([])
                                    setShowRestFields(false)
                                }}
                                errors={errors.collectorMobile}
                            />
                        </div>
                        <div className='text-end'>
                            <Button type="button" onClick={handleGetAgentData} disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Search'}
                            </Button>
                        </div>
                    </div>
                    <CustomizedInputWithLabel
                        label="Agent ID"
                        placeholder="Enter Agent ID"
                        disabled
                        {...register('agentId')}
                        errors={errors.agentId}
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        disabled
                        {...register('agencyName')}
                        errors={errors.agencyName}
                    />
                    <CustomizedInputWithLabel
                        label="Agent Mobile Number"
                        placeholder="Enter Agent Mobile Number"
                        disabled
                        {...register('agentMobileNumber')}
                        errors={errors.agentMobileNumber}
                    />

                    <CustomizedSelectInputWithLabel
                        label="Working Level"
                        list={workingLevelList}
                        disabled
                        {...register('division')}
                        errors={errors.division}
                    />
                    {listOfAvailableBinders.length > 0 &&
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">{pseudoLevelData}</label>
                            {errors?.binder && <span className="text-red-500">{errors.binder.message}</span>}
                            <div className="grid grid-cols-5 gap-4 mt-2">
                                {listOfAvailableBinders?.map((binder, index) => (
                                    <div key={`available_${binder.office_structure_id}`} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={binder.office_structure_id}
                                            className="mr-2"
                                            checked={selectedBinder.includes(binder.office_structure_id)}
                                            onChange={() => handleBinderChange(binder.office_structure_id)}

                                        />
                                        <label htmlFor={binder.office_structure_id} className="text-sm">{binder.office_structure_description}</label>
                                    </div>
                                ))}
                            </div>
                        </div>}

                    {
                        listOfOtherBinders?.map(item => (
                            <div className="col-span-2" key={item?.agency_id}>
                                <label className="block text-sm font-medium">Binder Allocated To {item?.agent_name}</label>
                                <div className="grid grid-cols-5 gap-4 mt-2">
                                    {item?.allocated_pseudo_office_structure?.map((binder, index) => (
                                        <div key={`other_${item.agency_id}_${binder.office_structure_id}`} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                value={binder.office_structure_id}
                                                className="mr-2"
                                                disabled
                                                checked
                                            />
                                            <label htmlFor={`allocated-${binder.office_structure_id}`} className="text-sm">{binder.office_structure_description}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit" variant="default" disabled={isSubmitting || !showRestFields}>
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
        </AuthUserReusableCode>
    );
};

export default BinderMapping;
