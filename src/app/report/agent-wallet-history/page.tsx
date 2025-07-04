'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { exportPicklist, getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadAgentWalletReport, downloadBillingReport, getAgentWalletHistory, getBillingReport } from '@/app/api-calls/report/api';
import { useSession } from 'next-auth/react';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agentWalletSchema, AgentWalletSchemaData } from '@/lib/zod';

const AgentWalletHistory = () => {

    const { data: session } = useSession()
    const currentUserId = session?.user?.userId
    const [isLoading, setIsLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [dataList, setDataList] = useState([])

    const [showTable, setShowTable] = useState(false)


    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AgentWalletSchemaData>({
        resolver: zodResolver(agentWalletSchema),
        defaultValues: {
            fromDate: "",
            toDate: "",
            agencyName: "",
            agentName: "",
            agentMobile: "",
            transactionType: "",
            transactionId: "",
            pageSize: tableDataPerPage,
        },
    });

    useEffect(() => {
        // const today = new Date();
        // const last30Days = new Date();
        // last30Days.setDate(today.getDate() - 30);

        // const formattedToday = today.toISOString().split('T')[0];
        // const formattedLast30Days = last30Days.toISOString().split('T')[0];

        // setFromDate(formattedLast30Days);
        // setToDate(formattedToday);

        // getReportData({
        //     transaction_date_range: {
        //         from_date: formattedLast30Days,
        //         to_date: formattedToday,
        //     },
        // });
    }, []);

    const formData = watch()

    const onSubmit = async () => {
        getReportData()
    }

    const getReportData = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: currentPage,
            page_size: formData?.pageSize,
            filter: {
                transaction_date_range: {
                    from_date: formData?.fromDate,
                    to_date: formData?.toDate,
                },
                ...formData?.agentName && { agent_name: formData?.agentName },
                ...formData?.agentMobile && { agent_mobile: formData?.agentMobile },
                ...formData?.transactionId && { transaction_id: formData?.transactionId },
                ...formData?.transactionType && { transaction_type: formData?.transactionType },
                ...formData?.agencyName && { agency_name: formData?.agencyName },
            }
        };

        payload = {
            ...payload,
            page,
            filter: {
                ...payload.filter,
                ...applyFilter
            }
        }

        try {
            setIsLoading(true);
            const response = await getAgentWalletHistory(payload, session?.user?.userId);
            setShowTable(true)
            setDataList(response.data.data);
            setCurrentPage(page);
            setTotalPages(response.data.totalPages)
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const columns = useMemo(() => [
        // { label: 'Date', key: 'userId', sortable: true },
        { label: 'Agency Name', key: 'agency_name', sortable: true },
        { label: 'Agent Name', key: 'agent_name', sortable: true },
        { label: 'Agent Mobile No.', key: 'agent_mobile', sortable: true },
        { label: 'Transaction Type', key: 'transaction_type', sortable: true },
        { label: 'Transaction ID', key: 'transaction_id', sortable: true },
        { label: 'Transaction Amount', key: 'transaction_amount', sortable: true, align: 'center' },
        { label: 'Current Balance', key: 'balance_after_txn', sortable: true, align: 'center' },
        { label: 'Previous Balance', key: 'balance_before_txn', sortable: true, align: 'center' },
        { label: 'Transaction Date & Time', key: 'transaction_date', sortable: true },
        { label: 'Remarks', key: 'remarks', sortable: true },
        { label: 'Transaction By', key: 'created_by_user', sortable: true },
    ], []);

    const handleExportFile = async (data: AgentWalletSchemaData, type = 'pdf') => {
        try {
            setIsLoading(true);
            let payload = {
                transaction_date_range: {
                    from_date: formData?.fromDate,
                    to_date: formData?.toDate,
                },
                ...formData?.agentName && { agent_name: formData?.agentName },
                ...formData?.agentMobile && { agent_mobile: formData?.agentMobile },
                ...formData?.transactionId && { transaction_id: formData?.transactionId },
                ...formData?.transactionType && { transaction_type: formData?.transactionType },
                ...formData?.agencyName && { agency_name: formData?.agencyName },

            }
            const response = await downloadAgentWalletReport(payload, type, session?.user?.userId)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "AgentWalletHistory";

            if (contentDisposition) {
                const matches = contentDisposition.match(/filename="(.+)"/);
                if (matches && matches.length > 1) {
                    filename = matches[1];
                }
            }

            const contentType = response.headers["content-disposition"];
            let extension = type;

            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = filename.includes(`.${extension}`) ? filename : `${filename}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    const handlePageChange = (page: number) => {
        getReportData({}, page)
    };

    return (
        <AuthUserReusableCode pageTitle="Agent Wallet History" isLoading={isLoading}>
            <div className="grid grid-cols-5 gap-4">
                <CustomizedInputWithLabel
                    label="From Date"
                    type="date"
                    {...register("fromDate")}
                    errors={errors.fromDate}
                />

                <CustomizedInputWithLabel
                    label="To Date"
                    type="date"
                    {...register("toDate")}
                    errors={errors.toDate}
                />

                <CustomizedInputWithLabel
                    label="Agency Name"
                    {...register("agencyName")}
                    errors={errors.agencyName}
                />

                <CustomizedInputWithLabel
                    label="Agent Name"
                    {...register("agentName")}
                    errors={errors.agentName}
                />
                <CustomizedInputWithLabel
                    label="Agent Mobile no"
                    type="number"
                    {...register("agentMobile")}
                    errors={errors.agentMobile}
                />

                <CustomizedInputWithLabel
                    label="Transaction Type"
                    {...register("transactionType")}
                    errors={errors.transactionType}
                />

                <CustomizedInputWithLabel
                    label="Transaction ID"
                    {...register("transactionId")}
                    errors={errors.transactionId}
                />
                <CustomizedInputWithLabel
                    label="Page Size"
                    {...register("pageSize", { valueAsNumber: true })}
                    errors={errors.pageSize}
                />
                <div className={`flex self-end mb-1 self-end ${errors?.pageSize ? 'mb-5' : ''}`}>
                    <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>Search</Button>
                </div>
                <CustomizedSelectInputWithLabel
                    label="Export"
                    placeholder='Export To'
                    list={exportPicklist}
                    // value={transactionId}
                    onChange={(e) => {
                        const exportType = e.target.value;
                        handleSubmit((data) => handleExportFile(data, exportType))();
                    }}
                />
            </div>

            <div className="overflow-x-auto mt-4">
                {showTable && <ReactTable
                    data={dataList}
                    columns={columns}
                    dynamicPagination
                    itemsPerPage={tableDataPerPage}
                    pageNumber={currentPage}
                    totalPageNumber={totalPages}
                    onPageChange={handlePageChange}
                    customExport={true}
                    // handleExportFile={handleExportFile}
                    hideSearchAndOtherButtons
                />}
            </div>
        </AuthUserReusableCode >
    );
};

export default AgentWalletHistory;
