"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import ReactTable from "@/components/ReactTable";
import { Button } from "@/components/ui/button";
import { formatDate, tableDataPerPage } from "@/lib/utils";
import { downloadSlipSupervisorBankDeposit, getSupervisorBankDepositReport } from "@/app/api-calls/report/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye } from "lucide-react";
import { supervisorBankDepositTableSchema, SupervisorBankDepositTableSchemaData } from "@/lib/zod";
import { getAgenciesWithDiscom } from '@/app/api-calls/department/api';
import { useSession } from 'next-auth/react';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';

const SupervisorBankDepositReport = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showTable, setShowTable] = useState(false);
    const { data: session } = useSession();
    const [agencyList, setAgencyList] = useState([]);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
    } = useForm<SupervisorBankDepositTableSchemaData>({
        resolver: zodResolver(supervisorBankDepositTableSchema),
        defaultValues: {
            dateFrom: "",
            dateTo: "",
            agencyName: "",
            pageSize: tableDataPerPage,
        },
    });

    const formData = watch();

    const fetchAgencies = async () => {
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId);
            setAgencyList(
                response?.data?.map((item) => ({
                    label: item.agency_name,
                    value: item.id,
                }))
            );
        } catch (err) {
            console.log('Failed to load agencies', err);
        }
    };

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchReport = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: page,
            page_size: formData?.pageSize,
            filter: {
                ...(formData.dateFrom && formData.dateTo) && {
                    deposit_date_range: {
                        from_date: formData.dateFrom,
                        to_date: formData.dateTo,
                    },
                },
                ...formData.agencyName && {
                    agency_name: formData.agencyName,
                },
            },
        };

        payload = {
            ...payload,
            page: page,
            filter: {
                ...payload.filter,
                ...applyFilter,
            },
        };
        setIsLoading(true);
        try {
            const response = await getSupervisorBankDepositReport(payload);
            setShowTable(true);
            setData(response?.data?.data);
            setCurrentPage(page);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data.");
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: "Agency ID", key: "agency_id", sortable: true },
        { label: "Agency Name", key: "agency_name", sortable: true },
        { label: "Supervisor ID", key: "supervisor_id", sortable: true },
        { label: "Supervisor Name", key: "supervisor_name", sortable: true },
        { label: "Deposit Date", key: "deposit_date", sortable: true },
        { label: "Deposit Amount", key: "amount", sortable: true, align: "center" },
        { label: "Bank Ref. No.", key: "txn_ref_no", sortable: true },
        { label: "Slip Image", key: "slip" },
        { label: "Created Date", key: "created_on_date", sortable: true },
    ], []);

    const handleSearch = () => {
        let payload = {
            ...(formData.dateFrom && formData.dateTo) && {
                deposit_date_range: {
                    from_date: formData.dateFrom,
                    to_date: formData.dateTo,
                },
            },
            ...formData.agencyName && {
                agency_name: formData.agencyName,
            },
        };
        fetchReport(payload, 1);
    };

    const handleGetSlip = async (id) => {
        setIsLoading(true);
        try {
            const response = await downloadSlipSupervisorBankDeposit(id);

            const defaultFileName = "Receipt";
            const extension = "png";

            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-GB').split('/').reverse().join('');
            const formattedTime = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '_');
            let filename = `${defaultFileName}_${formattedDate}_${formattedTime}.${extension}`;

            const contentDisposition = response.headers["content-disposition"];
            if (contentDisposition) {
                const matches = contentDisposition.match(/filename="?([^\"]+)"?/);
                if (matches && matches[1]) {
                    filename = matches[1];
                }
            }

            const contentType = response.headers["content-type"] || "image/png";

            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Failed to download');
        } finally {
            setIsLoading(false);
        }
    };

    const formattedData = data?.map(item => ({
        ...item,
        slip: item?.deposit_slip_file_name ?
            <Eye className='pointer' onClick={() => handleGetSlip(item?.id)} /> : '-',
        deposit_date: formatDate(item?.deposit_date),
        created_on_date: formatDate(item?.created_on_date),
    }));

    const handleAgencyChange = (e) => {
        const agency = agencyList.find(item => item.value === parseInt(e.target.value));
        setValue("agencyName", agency?.label || '');
    };

    return (
        <AuthUserReusableCode pageTitle="Supervisor Bank Deposit Report" isLoading={isLoading}>
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
                        label="Agency Name"
                        list={agencyList}
                        {...register("agencyId", { onChange: (e) => handleAgencyChange(e) })}
                        errors={errors.agencyId}
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
                    className={`mt-6`}
                >
                    Search
                </Button>
            </div>

            <div className="overflow-x-auto mb-4 mt-4">
                {showTable && <ReactTable
                    data={formattedData}
                    columns={columns}
                    hideSearchAndOtherButtons
                    dynamicPagination
                    itemsPerPage={formData?.pageSize}
                    pageNumber={currentPage}
                    totalPageNumber={totalPages}
                    onPageChange={(e) => fetchReport({}, e)}
                />}
            </div>
        </AuthUserReusableCode>
    );
};

export default SupervisorBankDepositReport; 