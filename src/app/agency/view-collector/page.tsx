'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactTable from "@/components/ReactTable";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { Loader2, UserRoundMinus, UserRoundPlus } from "lucide-react";
import { activateAgentById, deactivateAgentById, getAllAgentByAgencyId } from "@/app/api-calls/agency/api";
import { getAgenciesWithDiscom, getLevels } from "@/app/api-calls/department/api";
import AlertPopup from "@/components/Agency/ViewAgency/AlertPopup";
import { useSession } from "next-auth/react";
import { formatDate, getErrorMessage } from "@/lib/utils";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ViewAgentFormData, viewAgentSchema } from "@/lib/zod";
import { checkIfUserHasActionAccess } from "@/helper";
import SuccessErrorModal from "@/components/SuccessErrorModal";


const ViewCollector = () => {
    const { data: session } = useSession();

    const currentUserId = session?.user?.userId;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue, watch
    } = useForm({
        resolver: zodResolver(viewAgentSchema),
    });

    const [collectors, setCollectors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [workingLevelList, setWorkingLevelList] = useState([])

    const formData = watch();

    const loadCollectors = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await getAllAgentByAgencyId(id)
            const updatedCollectors = response.data.map((item) => ({
                ...item,
                workingLevelOffice: item?.working_level_office?.office_description
            }));

            const discomList = await getLevels(session?.user?.discomId);
            const listOfLevel = discomList.data.reduce((acc, item) => {
                acc[item.id] = item.levelName;
                return acc;
            }, {});
            const levelOptions = discomList.data.map((item) => ({
                label: item.levelName,
                value: item.levelName,
            }));
            let data = [{ label: 'All', value: 'all' }, ...levelOptions];
            setWorkingLevelList(data)

            setCollectors(updatedCollectors?.map((item) => {
                return {
                    ...item,
                    workingOffice: listOfLevel[item.working_level] || 'N/A',
                }
            }));
            setShowTable(true);
        } catch (error) {
            toast.error("Failed to load collectors.");
            console.error("Error fetching collectors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const activateAgent = async (id: number) => {
        setIsLoading(true);
        try {
            await activateAgentById(id, currentUserId);
            toast.success("Agent activated successfully.");
            loadCollectors(formData?.agencyId);
        } catch (error) {
            setIsErrorModalOpen(true)
            setErrorMessage("Error " + getErrorMessage(error));
            console.error("Error activating Agent:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deactivateAgent = async (id: number) => {
        setIsLoading(true);
        try {
            await deactivateAgentById(id, currentUserId);
            toast.success("Agent deactivated successfully.");
            loadCollectors(formData?.agencyId);
        } catch (error) {
            setIsErrorModalOpen(true)
            setErrorMessage("Error " + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: "Action", key: "action", sortable: false, ignored: true },
        { label: "Mobile Number", key: "primary_phone", sortable: true },
        { label: "Name", key: "agent_name", sortable: true },
        { label: "Working Office", key: "workingOffice", sortable: true },
        { label: "Working level office", key: "workingLevelOffice", sortable: true },
        { label: "Maximum Limit", key: "maximum_limit", sortable: true },
        { label: "Balance", key: "current_balance", sortable: true },
        { label: "From Validity", key: "validity_from_date", sortable: true },
        { label: "To Validity", key: "validity_to_date", sortable: true },
        { label: 'Aadhaar Number', key: 'aadharNo', sortable: true },
    ], []);

    const tableData = collectors.map((item) => ({
        ...item,
        validity_from_date: formatDate(item.validity_from_date),
        validity_to_date: formatDate(item.validity_to_date),
        action: item.is_active ? (
            <div className="flex gap-2">
                <AlertPopup triggerCode={<UserRoundMinus className="text-red-500 cursor-pointer" />} handleContinue={() => deactivateAgent(item.id)}
                    title='Confirm Deactivating' description={`Are you sure you want to deactivate ${item?.agent_name}?`}
                    continueButtonText='Confirm'
                />
            </div>
        ) : (
            <div className="flex gap-2">
                <AlertPopup triggerCode={<UserRoundPlus className="text-themeColor cursor-pointer" />} handleContinue={() => activateAgent(item.id)}
                    title='Confirm Activating' description={`Are you sure you want to activate ${item?.agent_name}?`}
                    continueButtonText='Confirm'
                />

            </div>
        ),
    }));

    const [agencyList, setAgencyList] = useState([])

    const [showTable, setShowTable] = useState(false);

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId);
            console.log("API Response:", response);
            setAgencyList(
                response?.data?.map((item) => ({
                    ...item,
                    label: item.agency_name,
                    value: item.id,
                }))
            );

        } catch (error) {
            console.error("Failed to get agency:", getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }

    }

    const [isNotAgency, setIsNotAgency] = useState(false);

    const onSubmit = (data: ViewAgentFormData) => {
        loadCollectors(data?.agencyId)
    };

    useEffect(() => {
        if (
            checkIfUserHasActionAccess({
                backendScope: session?.user?.userScopes,
                currentAction: 'addOrEditAgent'
            })) {
            getAgencyList();
            setIsNotAgency(true)
        } else {
            setValue('agencyId', session?.user?.userId)
            loadCollectors(session?.user?.userId);
            setIsNotAgency(false);
        }
    }, []);

    const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState('')

    return (
        <AuthUserReusableCode pageTitle="View Agent" isLoading={isLoading}>
            {
                isNotAgency &&
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex gap-4">
                        <CustomizedSelectInputWithLabel label='Agency'
                            list={agencyList}
                            containerClass='flex-1'
                            {...register('agencyId', {
                                valueAsNumber: true
                            })}
                            errors={errors.agencyId}
                        />
                        <div className="col-span-1 mt-6 align-end">
                            <Button type="submit" variant="default" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    'Submit'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            }
            {
                showTable &&
                <ReactTable data={tableData} columns={columns} />
            }
            <SuccessErrorModal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}
                message={errorMessage} type="error" />
        </AuthUserReusableCode>
    );
};

export default ViewCollector;
