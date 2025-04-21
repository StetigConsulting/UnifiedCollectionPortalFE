'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { tableDataPerPage } from '@/lib/utils';
import { getAgentBankDepositReport, getDepositAcknowledgementReport } from '@/app/api-calls/report/api';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { agentBankDepositTableSchema, AgentBankDepositTableSchemaData } from '@/lib/zod';

const AgentDepositAcknowledgementReport = () => {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [agencyName, setAgencyName] = useState('');
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [showTable, setShowTable] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        watch,
    } = useForm<AgentBankDepositTableSchemaData>({
        resolver: zodResolver(agentBankDepositTableSchema),
        defaultValues: {
            dateFrom: "",
            dateTo: "",
            agencyName: "",
            pageSize: tableDataPerPage
        },
    });

    useEffect(() => {
        // fetchReport();
    }, []);

    const formData = watch()

    const fetchReport = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: page,
            page_size: formData?.pageSize,
            filter: {
                ...(formData.dateFrom && formData.dateTo) && {
                    deposit_date_range: {
                        "from_date": formData.dateFrom,
                        "to_date": formData.dateTo
                    }
                },
                ...agencyName && {
                    agency_name: agencyName
                }
            }
        }

        payload = {
            ...payload,
            page: page,
            filter: {
                ...payload.filter,
                ...applyFilter
            }
        }
        setIsLoading(true);
        try {
            const response = await getAgentBankDepositReport(payload)
            setShowTable(true)
            setData(response?.data?.data);
            setCurrentPage(page);
            setTotalPages(response.data.totalPages)
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data.');
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'Agency ID', key: 'agency_id', sortable: true },
        { label: 'Agency Name', key: 'agency_name', sortable: true },
        { label: 'Supervisor ID', key: 'supervisor_id', sortable: true },
        { label: 'Supervisor Name', key: 'supervisor_name', sortable: true },
        { label: 'Deposit Date', key: 'deposit_date', sortable: true },
        { label: 'Deposit Amount', key: 'amount', sortable: true, align: 'center' },
        { label: 'Bank Ref. No.', key: 'txn_ref_no', sortable: true },
        { label: 'Slip Image', key: 'slip' }
    ], []);

    const handleSearch = () => {
        let payload = {
            ...(formData.dateFrom && formData.dateTo) && {
                deposit_date_range: {
                    "from_date": formData.dateFrom,
                    "to_date": formData.dateTo
                }
            },
            ...formData.agencyName && {
                agency_name: formData.agencyName
            }
        }
        fetchReport(payload, 1)
    }

    return (
        <AuthUserReusableCode pageTitle="Agent Bank Deposit Report" isLoading={isLoading}>
            <div className="flex items-center gap-4">
                <div className="grid grid-cols-4 gap-4 flex-grow">
                    <CustomizedInputWithLabel
                        label="From Date"
                        type="date"
                        {...register("dateFrom")}
                        errors={errors.dateFrom}
                    />
                    <CustomizedInputWithLabel
                        label="To Date"
                        type="date"
                        {...register("dateTo")}
                        errors={errors.dateTo}
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        {...register("agencyName")}
                        errors={errors.agencyName}
                    />
                    <CustomizedInputWithLabel
                        label="Page Size"
                        type="number"
                        {...register("pageSize", { valueAsNumber: true })}
                        errors={errors.pageSize}
                    />
                </div>
                <Button
                    onClick={handleSubmit(handleSearch)}
                    className={`self-end ${errors?.dateFrom || errors?.dateTo || errors?.pageSize ? 'mb-5' : ''}`}
                >
                    Search
                </Button>
            </div>

            <div className="overflow-x-auto mb-4 mt-4">
                {showTable && <ReactTable
                    data={data}
                    columns={columns}
                    hideSearchAndOtherButtons
                    dynamicPagination
                    itemsPerPage={formData?.pageSize}
                    pageNumber={currentPage}
                    totalPageNumber={totalPages}
                    onPageChange={(e) => fetchReport({}, e)}
                />}
            </div>

            <div className="flex justify-between">
            </div>
        </AuthUserReusableCode>
    );
};

export default AgentDepositAcknowledgementReport;
