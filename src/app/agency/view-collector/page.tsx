'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactTable from "@/components/ReactTable";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { UserRoundMinus, UserRoundPlus } from "lucide-react";
import { activateAgentById, deactivateAgentById, getAllAgentByAgencyId } from "@/app/api-calls/agency/api";

// API calls (commented out for now)
// import { activateCollector, deactivateCollector, fetchCollectors } from "@/app/api-calls/collector/api"; 

const ViewCollector = () => {
    const [collectors, setCollectors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadCollectors();
    }, []);

    const loadCollectors = async () => {
        setIsLoading(true);
        try {
            const response = await getAllAgentByAgencyId(30)//hardcoded
            const updatedCollectors = response.data.map((item) => ({
                ...item,
                workingLevelOffcie: item.working_level_office.office_description
            }));

            setCollectors(updatedCollectors);
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
            await activateAgentById(id, 6);//harcoded
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
            await deactivateAgentById(id, 6);//harcoded
            toast.success("Collector deactivated successfully.");
            loadCollectors();
        } catch (error) {
            toast.error("Failed to deactivate the collector.");
            console.error("Error deactivating collector:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: "Action", key: "action", sortable: false, ignored: true },
        { label: "Mobile Number", key: "primary_phone", sortable: true },
        { label: "Name", key: "agent_name", sortable: true },
        { label: "Working level office", key: "workingLevelOffcie", sortable: true },
        { label: "Maximum Limit", key: "maximum_limit", sortable: true },
        { label: "Balance", key: "current_balance", sortable: true },
        { label: "From Validity", key: "validity_from_date", sortable: true },
        { label: "To Validity", key: "validity_to_date", sortable: true },
    ], []);

    const tableData = collectors.map((item) => ({
        ...item,
        action: item.is_active ? (
            <div className="flex gap-2">
                <UserRoundMinus className="text-red-500 cursor-pointer" onClick={() => deactivateAgent(item.id)} />
            </div>
        ) : (
            <div className="flex gap-2">
                <UserRoundPlus className="text-themeColor cursor-pointer" onClick={() => activateAgent(item.id)} />
            </div>
        ),
    }));

    return (
        <AuthUserReusableCode pageTitle="View Collector" isLoading={isLoading}>
            <ReactTable data={tableData} columns={columns} />
        </AuthUserReusableCode>
    );
};

export default ViewCollector;
