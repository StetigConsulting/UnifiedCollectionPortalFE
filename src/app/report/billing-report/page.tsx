'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { exportPicklist, getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadBillingReport, getBillingReport } from '@/app/api-calls/report/api';
import { useSession } from 'next-auth/react';
import { BillingReportFormData, billingReportSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';

const BillingReport = () => {

    const { data: session } = useSession()
    const currentUserId = session?.user?.userId
    const [isLoading, setIsLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [dataList, setDataList] = useState([])

    const [showTable, setShowTable] = useState(false)

    const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<BillingReportFormData>({
        resolver: zodResolver(billingReportSchema),
        defaultValues: {
            workingLevel: null,
            circle: [],
            division: [],
            subDivision: [],
            section: [],
            pageSize: tableDataPerPage
        }
    });

    // useEffect(() => {
    //     getReportData();
    // }, []);

    const getReportData = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: currentPage,
            page_size: formData?.pageSize,
            filter: {
                bill_issue_date_range: {
                    from_date: formData?.fromDate,
                    to_date: formData?.toDate
                }
            }
        }

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
            const response = await getBillingReport(payload, currentUserId);
            setDataList(response.data.data);
            setShowTable(true)
            setCurrentPage(page);
            setTotalPages(response.data.totalPages)
            setIsLoading(false);
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const columns = useMemo(() => [
        { label: 'Bill Issue Date', key: 'bill_issue_date', sortable: true },
        { label: 'Bill Count', key: 'bill_count', sortable: true },
    ], []);

    const [exportType, setExportType] = useState('')

    const getPayload = (data) => {
        let filter = {
            bill_issue_date_range: {
                from_date: data?.fromDate,
                to_date: data?.toDate
            }
        }
        return filter;
    }

    const handleExportFile = async (data, type = 'pdf') => {
        setExportType(type)
        try {
            setIsLoading(true);
            let payload = getPayload(formData)
            const response = await downloadBillingReport(payload, type)

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
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
            setExportType('')
        }
    }

    const handlePageChange = (page: number) => {
        getReportData({}, page)
    };

    const onSubmit = (data) => {
        getReportData({}, 1);
    };

    const formData = watch()

    return (
        <AuthUserReusableCode pageTitle="Billing Report" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4">
                <div className="grid grid-cols-5 gap-4 flex-grow">
                    <CustomizedInputWithLabel
                        label="From Date"
                        type="date"
                        {...register('fromDate')}
                        errors={errors.fromDate}
                    />
                    <CustomizedInputWithLabel
                        label="To Date"
                        type="date"
                        {...register('toDate')}
                        errors={errors.toDate}
                    />
                    <CustomizedInputWithLabel label='Page Size'
                        {...register('pageSize', { valueAsNumber: true })} errors={errors?.pageSize} />

                    <div className='mt-6'>
                        <Button variant='default' type='submit'>Search</Button>
                    </div>
                    <CustomizedSelectInputWithLabel
                        label="Export"
                        placeholder='Export to'
                        list={exportPicklist}
                        value={exportType}
                        onChange={(e) => {
                            const exportType = e.target.value;
                            handleSubmit((data) => handleExportFile(data, exportType))();
                        }}
                    />
                </div>
            </form>
            {showTable && <div className="overflow-x-auto mt-4">
                <ReactTable
                    data={dataList}
                    columns={columns}
                    dynamicPagination
                    itemsPerPage={tableDataPerPage}
                    pageNumber={currentPage}
                    totalPageNumber={totalPages}
                    onPageChange={handlePageChange}
                    hideSearchAndOtherButtons
                />
            </div>}
        </AuthUserReusableCode>
    );
};

export default BillingReport;
