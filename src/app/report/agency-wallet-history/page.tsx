'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { exportPicklist, getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadAgencyWalletReport, downloadAgentWalletReport, downloadBillingReport, getAgencyWalletHistory, getAgentWalletHistory, getBillingReport } from '@/app/api-calls/report/api';
import { useSession } from 'next-auth/react';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agencyWalletSchema, AgencyWalletSchemaData } from '@/lib/zod';
import CustomizedSelectInputWithSearch from '@/components/CustomizedSelectInputWithSearch';
import { getAgenciesWithDiscom } from '@/app/api-calls/department/api';

const AgencyWalletHistory = () => {

    const { data: session } = useSession()
    const currentUserId = session?.user?.userId
    const [isLoading, setIsLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [dataList, setDataList] = useState([])

    const [showTable, setShowTable] = useState(false);
    const [agencyOptions, setAgencyOptions] = useState<{ label: string; value: string }[]>([]);


    const {
        register,
        handleSubmit,
        getValues,
        watch,
        formState: { errors },
        setValue,
    } = useForm<AgencyWalletSchemaData>({
        resolver: zodResolver(agencyWalletSchema),
        defaultValues: {
            fromDate: "",
            toDate: "",
            agencyName: "",
            // agencyMobile: "",
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

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            const agencies = await getAgenciesWithDiscom(session?.user?.discomId);
            setAgencyOptions(
                agencies?.data?.map((a: any) => ({ label: a.agency_name + ' - ' + a.phone, value: a.phone }))
            );
        } catch (e) {
            console.error(e)
        }
    };

    const formData = watch()

    const getReportData = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: currentPage,
            page_size: formData?.pageSize,
            filter: {
                transaction_date_range: {
                    from_date: formData?.fromDate,
                    to_date: formData?.toDate,
                },
                ...formData?.agencyName && { agency_name: formData?.agencyName },
                // ...formData?.agencyMobile && { agency_mobile: formData?.agencyMobile },
                ...formData?.transactionId && { transaction_id: formData?.transactionId },
                ...formData?.transactionType && { transaction_type: formData?.transactionType },
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
            const response = await getAgencyWalletHistory(payload, session?.user?.userId);
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
        { label: 'Agency Name', key: 'agency_name', sortable: true },
        { label: 'Agency Mobile', key: 'agency_mobile', sortable: true },
        { label: 'TXN type', key: 'transaction_type', sortable: true },
        { label: 'Transaction id', key: 'transaction_id', sortable: true },
        { label: 'Top Up / Reverse', key: 'transaction_amount', sortable: true, align: 'center' },
        { label: 'Current Balance', key: 'balance_after_txn', sortable: true, align: 'center' },
        { label: 'Previous Balance', key: 'balance_before_txn', sortable: true, align: 'center' },
        { label: 'Remarks', key: 'remarks', sortable: true },
        { label: 'Transaction By', key: 'created_by_user', sortable: true },
        { label: 'Transaction Date & Time', key: 'transaction_date', sortable: true },
    ], []);

    const handleExportFile = async (data, type = 'pdf') => {
        try {
            setIsLoading(true);
            let payload = {
                transaction_date_range: {
                    from_date: formData?.fromDate,
                    to_date: formData?.toDate,
                },
                ...formData?.agencyName && { agency_name: formData?.agencyName },
                // ...formData?.agencyMobile && { agency_mobile: formData?.agencyMobile },
                ...formData?.transactionId && { transaction_id: formData?.transactionId },
                ...formData?.transactionType && { transaction_type: formData?.transactionType },
            }
            const response = await downloadAgencyWalletReport(payload, type, session?.user?.userId)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "AgencyWalletHistory";

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

    const onSubmit = async () => {
        await getReportData()
    }

    return (
        <AuthUserReusableCode pageTitle="Agency Wallet History" isLoading={isLoading}>
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

                <CustomizedSelectInputWithSearch
                    label="Agency"
                    list={agencyOptions}
                    value={getValues("agencyName")}
                    onChange={(val) => {
                        setValue("agencyName", val as string);
                    }}
                    placeholder="Select Agency"
                    errors={errors.agencyName}
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
                    type='number'
                    {...register("pageSize", { valueAsNumber: true })}
                    errors={errors.pageSize}
                />
                <div className={`flex self-end mb-1 ${errors?.pageSize ? 'mb-5' : ''}`}>
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
                {showTable &&
                    <ReactTable
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
                    />
                }
            </div>
        </AuthUserReusableCode >
    );
};

export default AgencyWalletHistory;
