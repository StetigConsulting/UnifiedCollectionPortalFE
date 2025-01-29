'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactTable from "@/components/ReactTable";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { UserRoundPlus } from "lucide-react";

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
            // const response = await fetchCollectors();
            const response = [
                { id: 1, mobileNumber: '7738141900', name: 'Satyam Aryaan', subDivision: '3411', section: '341101', maximumLimit: 'Rs. 200000', balance: 'Rs. 2000', validity: '06-12-2024', isActive: true },
                { id: 2, mobileNumber: '7738141901', name: 'Satyam Aryaan', subDivision: '3411', section: '341101', maximumLimit: 'Rs. 200000', balance: 'Rs. 2000', validity: '06-12-2024', isActive: false },
            ];
            setCollectors(response);
        } catch (error) {
            toast.error("Failed to load collectors.");
            console.error("Error fetching collectors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const activate = async (id: number) => {
        setIsLoading(true);
        try {
            // await activateCollector(id); 
            toast.success("Collector activated successfully.");
            loadCollectors();
        } catch (error) {
            toast.error("Failed to activate the collector.");
            console.error("Error activating collector:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deactivate = async (id: number) => {
        setIsLoading(true);
        try {
            // await deactivateCollector(id); 
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
        { label: "Mobile Number", key: "mobileNumber", sortable: true },
        { label: "Name", key: "name", sortable: true },
        { label: "Sub Division", key: "subDivision", sortable: true },
        { label: "Section", key: "section", sortable: true },
        { label: "Maximum Limit", key: "maximumLimit", sortable: true },
        { label: "Balance", key: "balance", sortable: true },
        { label: "Validity", key: "validity", sortable: true },
    ], []);

    const tableData = collectors.map((item) => ({
        ...item,
        action: item.isActive ? (
            <div className="flex gap-2">
                <UserRoundPlus className="text-red-500 cursor-pointer" onClick={() => deactivate(item.id)} />
            </div>
        ) : (
            <div className="flex gap-2">
                <UserRoundPlus className="text-themeColor cursor-pointer" onClick={() => activate(item.id)} />
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
