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

const AgentWalletHistory = () => {

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
        }
    }

    const columns = useMemo(() => [
        { label: 'User ID', key: 'userId', sortable: true },
        { label: 'Mobile Number', key: 'mobileNumber', sortable: true },
        { label: 'Franchise Name', key: 'franchiseName', sortable: true },
        { label: 'Collector Name', key: 'collectorName', sortable: true },
        { label: 'Current Balance', key: 'currentBalance', sortable: true },
        { label: 'Total Recharge', key: 'totalRecharge', sortable: true },
        { label: 'Total Collection', key: 'totalCollection', sortable: true },
        { label: 'Total', key: 'total', sortable: true },
    ], []);

    const handleDownloadPdf = async () => {
        try {
            setIsLoading(true);
            const response = await downloadBillingReport('pdf');
            console.log(response);
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(pdfBlob);

            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `billing_report_${currentUserId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const handlePageChange = (page: number) => {
        getReportData({}, page)
    };

    return (
        <AuthUserReusableCode pageTitle="Agent Wallet History" isLoading={isLoading}>
            <div className="overflow-x-auto">
                <ReactTable
                    data={dataList}
                    columns={columns}
                    dynamicPagination
                    itemsPerPage={tableDataPerPage}
                    pageNumber={currentPage}
                    totalPageNumber={totalPages}
                    onPageChange={handlePageChange}
                    downloadPdf={handleDownloadPdf}
                />
            </div>
        </AuthUserReusableCode>
    );
};

export default AgentWalletHistory;
