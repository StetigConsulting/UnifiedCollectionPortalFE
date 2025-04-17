'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { tableDataPerPage } from '@/lib/utils';
import { getDepositAcknowledgementReport } from '@/app/api-calls/report/api';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { agentDepositReportSchema, AgentDepositReportSchemaData } from '@/lib/zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const AgentDepositAcknowledgementReport = () => {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = useForm<AgentDepositReportSchemaData>({
        resolver: zodResolver(agentDepositReportSchema),
        defaultValues: {
            dateFrom: "",
            dateTo: "",
            acknowledgementType: "",
            pageSize: tableDataPerPage,
        },
    });
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [showTable, setShowTable] = useState(false)

    useEffect(() => {
        // fetchReport();
    }, []);

    const formData = watch()

    const fetchReport = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: page,
            page_size: formData?.pageSize,
            filter: {}
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
            const response = await getDepositAcknowledgementReport(payload)
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
        { label: 'Agent ID', key: 'agent_id', sortable: true },
        { label: 'Agent Name', key: 'agent_name', sortable: true },
        { label: 'Supervisor ID', key: 'supervisor_id', sortable: true },
        { label: 'Supervisor Name', key: 'supervisor_name', sortable: true },
        { label: 'Deposit Date', key: 'deposit_date', sortable: true },
        { label: 'Deposit Amount', key: 'deposit_amount', sortable: true, align: 'right' },
        { label: 'Acknowledgement', key: 'acknowledgement', sortable: true },
    ], []);

    const onSubmit = async (data: AgentDepositReportSchemaData) => {
        await handleSearch(data)
    }

    const handleSearch = (data: AgentDepositReportSchemaData) => {
        let payload = {
            ...data?.acknowledgementType && { acknowledgement: data?.acknowledgementType },
            ...(data?.dateFrom && data?.dateTo) && {
                deposit_date_range: {
                    "from_date": data?.dateFrom,
                    "to_date": data?.dateTo
                }
            },
        }
        fetchReport(payload, 1)
    }

    const handlePageChange = (page: number) => {
        fetchReport({}, page)
    };

    return (
        <AuthUserReusableCode pageTitle="Agent Deposit Acknowledgement Report" isLoading={isLoading}>
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
                    <CustomizedSelectInputWithLabel
                        label="Status"
                        list={[{ label: 'Pending', value: 'Pending' },
                        { label: 'Yes', value: 'Yes' },
                        { label: 'No', value: 'No' }]}
                        {...register("acknowledgementType")}
                        errors={errors.acknowledgementType}
                    />
                    <CustomizedInputWithLabel
                        label="Page Size"
                        type="number"
                        {...register("pageSize", { valueAsNumber: true })}
                        errors={errors.pageSize}
                    />
                </div>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    className={`self-end ${errors?.dateFrom || errors?.dateTo ? 'mb-5' : ''}`}
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
                    onPageChange={handlePageChange}
                />}
            </div>

            <div className="flex justify-between">
            </div>
        </AuthUserReusableCode>
    );
};

export default AgentDepositAcknowledgementReport;
