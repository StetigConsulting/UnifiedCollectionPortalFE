'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { collectionPostingStatusPickList, collectionTypePickList, exportPicklist, formatDate, getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadCollectionPostingReport, getCollectionPostingReport } from '@/app/api-calls/report/api';
import { CollectionPostingReportFormData, collectionPostingReportSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Copy, X, Zap } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const CollectionPosting = () => {

    const [isLoading, setIsLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pageSize, setPageSize] = useState(tableDataPerPage)

    const [dataList, setDataList] = useState([])

    const [showTable, setShowTable] = useState(false)

    const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<CollectionPostingReportFormData>({
        resolver: zodResolver(collectionPostingReportSchema),
        defaultValues: {
            pageSize: tableDataPerPage
        }
    });

    const getReportData = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: currentPage,
            page_size: formData?.pageSize,
            filter: {
                date_range: {
                    from_date: formData?.fromDate,
                    to_date: formData?.toDate,
                },
                ...formData?.status && { posting_status: formData?.status },
                ...formData?.collectionType && {
                    is_energy: formData?.collectionType === 'Energy' ? true : false
                },
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
            const response = await getCollectionPostingReport(payload);
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

    const formatData = dataList.map(item => ({
        ...item,
        dd_chq_date: formatDate(item.dd_chq_date),
        id: item?.collection_id
    }))

    const columns = useMemo(() => [
        { label: 'Collection Type', key: 'collection_type', sortable: true },
        { label: 'Consumer No', key: 'consumer_no', sortable: true },
        { label: 'Reference No', key: 'reference_no', sortable: true },
        { label: 'Src Notification No', key: 'src_notification_no', sortable: true },
        { label: 'Installment No', key: 'installment_no', sortable: true },
        { label: 'Consumer Name', key: 'consumer_name', sortable: true },
        { label: 'Transaction Date Time', key: 'txn_date_time', sortable: true },
        { label: 'Transaction Amount', key: 'txn_amt', sortable: true },
        { label: 'Transaction Id', key: 'txn_id', sortable: true },
        { label: 'Receipt No.', key: 'receipt_no', sortable: true },
        { label: 'Vendor ID', key: 'vendor_id', sortable: true },
        { label: 'Pay Mode', key: 'pay_mode', sortable: true },
        { label: 'DD Cheque No', key: 'dd_chq_no', sortable: true },
        { label: 'DD Cheque Date', key: 'dd_chq_date', sortable: true },
        { label: 'MICR', key: 'micr', sortable: true },
        { label: 'Device Id', key: 'device_id', sortable: true },
        { label: 'Agent Mobile No.', key: 'agent_mobile_no', sortable: true },
        { label: 'Agency Mobile No.', key: 'agency_mobile_no', sortable: true },
        { label: 'Posting Status', key: 'posting_status', sortable: true },
        { label: 'Billing Server Message', key: 'billing_server_msg', sortable: true },
        { label: 'No Of Retries', key: 'no_of_posting_retries', sortable: true },
    ], []);

    const [exportType, setExportType] = useState('')

    const getPayload = (data) => {
        let filter = {
            date_range: {
                from_date: formData?.fromDate,
                to_date: formData?.toDate,
            },
            ...formData?.status && { posting_status: formData?.status },
            ...formData?.collectionType && {
                is_energy: formData?.collectionType === 'Energy' ? true : false
            },
        }
        setPageSize(formData?.pageSize)
        return filter;
    }

    const handleExportFile = async (data, type = 'pdf') => {
        setExportType(type)
        try {
            setIsLoading(true);
            let payload = getPayload(formData)
            const response = await downloadCollectionPostingReport(payload, type)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "CollectionPostingReport";

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

    const onSubmit = async (data) => {
        setPageSize(formData?.pageSize)
        getReportData({}, 1);

    };

    const formData = watch()

    const [selectedRow, setSelectedRow] = useState<any | null>(null);

    const handleRowSelection = (row: any) => {
        setSelectedRow(row)
    }

    const getSelectedRowButton = () => {
        return <div className="space-x-4">
            <Button variant="default" onClick={() => {
                setModalType('request');
                setShowTransactionModal(true);
            }}>
                <Zap /> Request / Response
            </Button>
        </div>
    }

    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [modalType, setModalType] = useState<'request' | 'response'>('request');

    const handleCopy = () => {
        if (modalType === 'request') {
            navigator.clipboard.writeText(selectedRow?.billing_server_request || '');
            toast.success('Request copied to clipboard');
        } else {
            navigator.clipboard.writeText(selectedRow?.billing_server_response || '');
            toast.success('Response copied to clipboard');
        }
    }

    return (
        <AuthUserReusableCode pageTitle="Collection Posting" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4">
                <div className="grid grid-cols-4 gap-4 flex-grow">
                    <CustomizedInputWithLabel label='From Date' type='date'
                        {...register('fromDate')} errors={errors.fromDate} />
                    <CustomizedInputWithLabel label='To Date' type='date'
                        {...register('toDate')} errors={errors.toDate} />
                    <CustomizedSelectInputWithLabel label='Collection Type'
                        list={collectionTypePickList} {...register('collectionType')} errors={errors.collectionType} />
                    <CustomizedSelectInputWithLabel label='Status'
                        list={collectionPostingStatusPickList} {...register('status')} errors={errors.status} />
                    <CustomizedInputWithLabel label='Page Size'
                        {...register('pageSize', { valueAsNumber: true })}
                        errors={errors?.pageSize} />
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
                            exportType && handleSubmit((data) => handleExportFile(data, exportType))();
                        }}
                    />
                </div>
            </form>
            {showTable && <div className="overflow-x-auto mt-4">
                <ReactTable
                    data={formatData}
                    columns={columns}
                    dynamicPagination
                    itemsPerPage={pageSize}
                    pageNumber={currentPage}
                    totalPageNumber={totalPages}
                    onPageChange={handlePageChange}
                    hideSearchAndOtherButtons
                    isSelectable={true}
                    onRowSelect={handleRowSelection}
                    onRowSelectButtons={
                        getSelectedRowButton()
                    }
                    selectedRow={selectedRow}
                />
            </div>}

            <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
                <DialogContent className="max-w-6xl">
                    <DialogHeader>
                        <DialogTitle>{selectedRow?.txn_id}</DialogTitle>
                    </DialogHeader>

                    <DialogClose asChild>
                        <button className="absolute right-4 top-4 text-gray-500 hover:text-gray-800">
                            <X className="h-5 w-5" />
                        </button>
                    </DialogClose>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Request Box */}
                        <div className="bg-green-500 text-white p-4 rounded relative">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold">Request</h3>
                                <button onClick={() => {
                                    navigator.clipboard.writeText(selectedRow?.billing_server_request || '');
                                    toast.success("Request copied to clipboard");
                                }} className="text-white hover:underline">
                                    Copy
                                </button>
                            </div>
                            <div className="whitespace-pre-wrap text-sm max-h-[300px] overflow-y-auto">
                                {selectedRow?.billing_server_request || 'No request data available.'}
                            </div>
                        </div>

                        {/* Response Box */}
                        <div className="bg-red-500 text-white p-4 rounded relative">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold">Response</h3>
                                <button onClick={() => {
                                    navigator.clipboard.writeText(selectedRow?.billing_server_response || '');
                                    toast.success("Response copied to clipboard");
                                }} className="text-white hover:underline">
                                    Copy
                                </button>
                            </div>
                            <div className="whitespace-pre-wrap text-sm max-h-[300px] overflow-y-auto">
                                {selectedRow?.billing_server_response || 'No response data available.'}
                            </div>
                        </div>
                    </div>

                </DialogContent>
            </Dialog>
        </AuthUserReusableCode>
    );
};

export default CollectionPosting;
