'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactTable from "@/components/ReactTable";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { getAllAgentDepositAcknowledgement, updateDepositAcknowlegment } from "@/app/api-calls/agency/api";
import { useSession } from "next-auth/react";
import { formatDate, getErrorMessage } from "@/lib/utils";

const AgentDepositAcknowledgement = () => {
    const { data: session } = useSession();

    const currentUserId = session?.user?.userId;

    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadDepositAcknowledgementDetails();
    }, []);

    const loadDepositAcknowledgementDetails = async () => {
        setIsLoading(true);
        try {
            const response = await getAllAgentDepositAcknowledgement()
            setData(response.data)
        } catch (error) {
            console.error("Error fetching deposit:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateAcknowledgement = async (id: string, type: string) => {
        setIsLoading(true);
        try {
            let payload = {
                agent_deposit_acknowledgement_id: id,
                acknowledgement: type
            }
            await updateDepositAcknowlegment(payload);
            toast.success("Acknowledgement details updated successfully.");
            loadDepositAcknowledgementDetails();
        } catch (error) {
            toast.error("Error: " + getErrorMessage(error));
            console.error("Error: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: "Agent ID", key: "agent_id", sortable: true },
        { label: "Agent Name", key: "agent_name", sortable: true },
        { label: "Deposit Date", key: "deposit_date", sortable: true },
        { label: "Deposit Amount", key: "deposit_amount", sortable: true },
        { label: "Acknowledgement", key: "action", sortable: true },
    ], []);

    const tableData = data.map((item) => ({
        ...item,
        deposit_date: formatDate(item?.deposit_date),
        action:
            <div className="flex gap-2">
                {/* <AlertPopup triggerCode={<UserRoundMinus className="text-red-500 cursor-pointer" />} handleContinue={() => deactivateAgent(item.id)}
                    title='Confirm Deactivating' description={`Are you sure you want to deactivate ${item?.agent_name}?`}
                    continueButtonText='Confirm'
                /> */}
                <Button size='sm' variant="success" onClick={() => { updateAcknowledgement(item?.id, 'Yes') }}>Yes</Button>
                <Button size='sm' variant="destructive" onClick={() => { updateAcknowledgement(item?.id, 'No') }}>No</Button>
            </div>
    }));

    return (
        <AuthUserReusableCode pageTitle="Agent Deposit Acknowledgement" isLoading={isLoading}>
            <ReactTable data={tableData} columns={columns} customActionButton={<div></div>} />
        </AuthUserReusableCode>
    );
};

export default AgentDepositAcknowledgement;
