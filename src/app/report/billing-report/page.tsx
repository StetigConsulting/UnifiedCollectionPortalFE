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

    const handleDownloadPdf = async () => {
        try {
            setIsLoading(true);
            const response = await downloadBillingReport('pdf');
            console.log(response.headers['content-disposition']);
            const rawDisposition = response.request.getResponseHeader('Content-Disposition');
            console.log('Raw Content-Disposition:', rawDisposition);
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(pdfBlob);

            handleDownload(pdfUrl);
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const handleDownload = (contentUrl: any) => {
        const link = document.createElement('a');
        link.href = contentUrl;
        link.download = `billing_report_${currentUserId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    downloadPdf={handleDownloadPdf}
                />
            </div>
        </AuthUserReusableCode>
    );
};

export default BillingReport;
