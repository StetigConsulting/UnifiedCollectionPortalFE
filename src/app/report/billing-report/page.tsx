'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadBillingReport, getBillingReport } from '@/app/api-calls/report/api';
import { useSession } from 'next-auth/react';

const BillingReport = () => {

    const { data: session } = useSession()
    const currentUserId = session?.user?.userId
    const [isLoading, setIsLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [dataList, setDataList] = useState([])

    useEffect(() => {
        getReportData();
    }, []);

    const getReportData = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: currentPage,
            page_size: tableDataPerPage
        }

        payload = {
            ...payload,
            page
        }

        try {
            setIsLoading(true);
            const response = await getBillingReport(payload, currentUserId);
            setDataList(response.data.data);
            setCurrentPage(page);
            setTotalPages(response.data.totalPages)
            setIsLoading(false);
        } catch (error) {
            console.log(getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const columns = useMemo(() => [
        { label: 'Bill Issue Date', key: 'bill_issue_date', sortable: true },
        { label: 'Bill Count', key: 'bill_count', sortable: true },
    ], []);

    const handleExportFile = async (type = 'pdf') => {
        try {
            const response = await downloadBillingReport(type)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "BillingReport";

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
            console.error("Error downloading the report:", error);
        }
    }

    const handlePageChange = (page: number) => {
        getReportData({}, page)
    };

    return (
        <AuthUserReusableCode pageTitle="Billing Report" isLoading={isLoading}>
            <div className="overflow-x-auto">
                <ReactTable
                    data={dataList}
                    columns={columns}
                    dynamicPagination
                    itemsPerPage={tableDataPerPage}
                    pageNumber={currentPage}
                    totalPageNumber={totalPages}
                    onPageChange={handlePageChange}
                    customExport={true}
                    handleExportFile={handleExportFile}
                />
            </div>
        </AuthUserReusableCode>
    );
};

export default BillingReport;
