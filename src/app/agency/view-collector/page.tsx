'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactTable from "@/components/ReactTable";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { UserRoundMinus, UserRoundPlus } from "lucide-react";
import { activateAgentById, deactivateAgentById, getAllAgentByAgencyId } from "@/app/api-calls/agency/api";
import { getLevels } from "@/app/api-calls/department/api";
import AlertPopup from "@/components/Agency/ViewAgency/AlertPopup";
import { useSession } from "next-auth/react";

const ViewCollector = () => {
    const { data: session } = useSession();

    const currentUserId = session?.user?.userId;

    const [collectors, setCollectors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [workingLevelList, setWorkingLevelList] = useState([])

    useEffect(() => {
        loadCollectors();
    }, []);

    const loadCollectors = async () => {
        setIsLoading(true);
        try {
            const response = await getAllAgentByAgencyId(currentUserId)
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
            loadCollectors();
        } catch (error) {
            toast.error("Failed to activate the Agent.");
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
            loadCollectors();
        } catch (error) {
            toast.error("Failed to deactivate the Agent.");
            console.error("Error deactivating collector:", error);
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
    ], []);

    const tableData = collectors.map((item) => ({
        ...item,
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

    return (
        <AuthUserReusableCode pageTitle="View Agent" isLoading={isLoading}>
            <ReactTable data={tableData} columns={columns} />
        </AuthUserReusableCode>
    );
};

export default ViewCollector;
