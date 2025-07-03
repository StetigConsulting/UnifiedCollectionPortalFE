'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { exportPicklist, formatDate, getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadCancelledTransactions, downloadReconciliationReport, downloadTotalCollectionReport, getCancelledTransactions, getReconciliationReport, getTotalCollectionReport } from '@/app/api-calls/report/api';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { getAgenciesWithDiscom, getAllPaymentModes, getLevels, getLevelsDiscomId, getListOfAllSupervisor } from '@/app/api-calls/department/api';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ReconciliationReportFormData, reconciliationReportSchema } from '@/lib/zod';
import { getAllAgentByAgencyId } from '@/app/api-calls/agency/api';
import NormalReactTable from '@/components/NormalReactTable';
import ReactTableReconciliation from '@/components/ReactTableReconciliation';

const ReconciliationReport = () => {
    const { data: session } = useSession()

    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [dataList, setDataList] = useState([]);

    const [showTable, setShowTable] = useState(false)

    const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<ReconciliationReportFormData>({
        resolver: zodResolver(reconciliationReportSchema),
        defaultValues: {
            pageSize: tableDataPerPage
        }
    });

    const formData = watch();

    const [pageSize, setPageSize] = useState(formData?.pageSize)

    const [agencyName, setAgencyName] = useState<string | null>(null);

    useEffect(() => {
        // getReportData();
    }, []);

    const [exportType, setExportType] = useState('')

    const getReportData = async (applyFilter = {}, page = 1) => {

        let payload = {
            page: currentPage,
            page_size: formData?.pageSize,
            filter: {
                date_range: {
                    from_date: formData.fromDate,
                    to_date: formData.toDate
                },
                ...formData?.agency && { agency_name: agencyName },
                ...formData?.supervisor && { supervisor_id: formData?.supervisor },
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
            const response = await getReconciliationReport(payload);
            setPageSize(formData?.pageSize);
            setShowTable(true)
            setDataList([response.data.data]);
            let data = response?.data?.data

            setSummaryTableData(
                [{ sl_no: 1, amount_type: "Total Acknowledgement Pending", amount: data?.total_acknowledge_pending },
                { sl_no: 2, amount_type: "Total Amount With Supervisor", amount: data?.total_amt_with_supervisor },
                { sl_no: 3, amount_type: "Amount deposited by Supervisor", amount: data?.amt_deposited_by_supervisor },
                { sl_no: 4, amount_type: "Amount balance with Supervisor", amount: data?.amt_balance_with_supervisor }])
            setCurrentPage(page);
            setTotalPages(response.data.totalPages)
        } catch (error) {
            console.error(getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const getPayload = (data) => {

        let filter = {
            date_range: {
                from_date: data.fromDate,
                to_date: data.toDate
            },
            ...formData?.agency && { agency_name: agencyName },
            ...formData?.supervisor && { supervisor_id: formData?.supervisor },
        }

        return filter
    }

    const onSubmit = (data) => {
        let payload = getPayload(data)
        getReportData(payload, 1);
    };

    const handleExportFile = async (data, type = 'pdf') => {
        setExportType(type)
        try {
            setIsLoading(true);
            let payload = getPayload(formData)
            const response = await downloadReconciliationReport(payload, type)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "ReconciliationReport";

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
        } finally {
            setIsLoading(false);
            setExportType('')
        }
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        let payload = getPayload(formData)
        getReportData(payload, page)
    }

    const [agencyList, setAgencyList] = useState([]);

    const getAgencyList = async () => {
        setIsLoading(true)
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId)
            setAgencyList(response?.data?.map((item) => ({
                ...item,
                label: `${item?.agency_name} - ${item?.phone}`,
                value: item?.id,
            })))
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const [supervisorList, setSupervisorList] = useState([]);

    const getSupervisorList = async (agencyId: number) => {
        setIsLoading(true);
        try {
            const response = await getListOfAllSupervisor(agencyId);
            setSupervisorList(
                response?.data?.map((item) => ({
                    label: `${item?.supervisor_name} - ${item?.phone}`,
                    value: item.id,
                }))
            );
        } catch (error) {
            console.error(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAgencySelect = (e) => {
        const agencyId = e.target.value;
        let agencyDetails = agencyList.filter((item: any) => item.id === Number(agencyId))
        setAgencyName(prev => agencyDetails?.[0]?.agency_name || null);
        setValue('agency', agencyId);
        setValue('supervisor', '');
        setSupervisorList([]);
        if (agencyId)
            getSupervisorList(agencyId);
    }

    useEffect(() => {
        getAgencyList();
        // setSummaryTableData([])
    }, []);

    // const columns = useMemo(() => [
    //     { label: 'Sl No.', key: 'index' },
    //     { label: 'Agent Mobile Number', key: 'agent_mobile' },
    //     { label: 'Agent Name', key: 'agent_name' },
    //     { label: 'Amount To Pay', key: 'amount_to_pay' },
    //     { label: 'Amount Paid', key: 'amount_paid' },
    // ], []);

    // const formattedData = () => {
    //     let data = [];
    //     let index = 1;
    //     dataList?.map((item) => {
    //         let subdata = item?.data
    //             ?.map((subItem) => ({
    //                 index: index++,
    //                 agent_name: subItem.agent_name || "-",
    //                 agent_mobile: subItem.agent_mobile,
    //                 amount_to_pay: subItem.amount_paid,
    //                 amount_paid: subItem.amount_acknowledged_paid,
    //             }))
    //         if (subdata?.length > 0) {
    //             data.push(...subdata)
    //         }
    //         data.push(
    //             {
    //                 index: 'Total',
    //                 amount_paid: item.total

    //             },
    //             {
    //                 index: "Total Amount To Pay",
    //                 amount_paid: item.totalToPay
    //             },
    //             {
    //                 index: "Previous Day Balance",
    //                 amount_paid: item.previousDayBalance
    //             },
    //             {
    //                 index: "Total Amount With Supervisor",
    //                 amount_paid: item.totalWithSupervisor
    //             },
    //             {
    //                 index: "Date",
    //                 agent_mobile: formatDate(item.date),
    //                 agent_name: "Amount Deposited",
    //                 amount_paid: item.amount
    //             },
    //             {
    //                 index: "Balance With Supervisor",
    //                 amount_paid: item.balanceWithSupervisor
    //             }
    //         );
    //     })
    //     return data
    // }

    const columnsOther = useMemo(() => [
        { label: 'Sl No.', key: 'index' },
        { label: 'Agent Name', key: 'agent_name' },
        { label: 'Agent Mobile Number', key: 'agent_mobile' },
        { label: 'Total Collection Amount', key: 'total_collection_amount' },
        { label: 'Acknowledgement Amount', key: 'acknowledgement_amount' },
    ], []);

    const formattedDataOther = () => {
        let data = [];
        let index = 1;
        dataList?.map((item) => {
            let subdata = item?.data
                ?.map((subItem) => ({
                    index: index++,
                    agent_name: subItem.agent_name || "-",
                    agent_mobile: subItem.agent_mobile,
                    total_collection_amount: subItem.amount_paid,
                    acknowledgement_amount: subItem.amount_acknowledged_paid,
                }))
            if (subdata?.length > 0) {
                data.push(...subdata)
            }
            data.push(
                {
                    index: 'Total',
                    total_collection_amount: item.total_collection_amt_paid,
                    acknowledgement_amount: item.total_amt_acknowledged_paid
                }
            );

        })
        return data
    }

    const [summaryTableData, setSummaryTableData] = useState([]);

    const summaryTableColumn = useMemo(() => [
        { label: 'Sl No.', key: 'sl_no' },
        { label: 'Amount Type', key: 'amount_type' },
        { label: 'Amount', key: 'amount' },
    ], []);

    return (
        <AuthUserReusableCode pageTitle="Reconciliation Report" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4">
                <div className="grid grid-cols-6 gap-4 flex-grow">
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
                    <CustomizedSelectInputWithLabel
                        label='Agency' list={agencyList} {...register('agency', {
                            onChange: (e) => handleAgencySelect(e)
                        })} errors={errors.agency} />
                    <CustomizedSelectInputWithLabel label='Supervisor' list={supervisorList}
                        {...register('supervisor')} errors={errors.supervisor} />
                    <CustomizedInputWithLabel
                        label="Page Size"
                        {...register('pageSize', { valueAsNumber: true })}
                        errors={errors.pageSize}
                    />

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

            <div className="overflow-x-auto mb-4 mt-4 flex flex-col gap-4">
                {/* {showTable && */}
                {/* <ReactTableReconciliation
                    data={formattedData()}
                    avoidSrNo
                    columns={columns}
                    hideSearchAndOtherButtons
                    dynamicPagination
                    itemsPerPage={pageSize}
                    pageNumber={currentPage}
                    onPageChange={handlePageChange}
                    totalPageNumber={totalPages} */}
                {/* /> */}
                {/* } */}

                {showTable &&
                    <>
                        <ReactTableReconciliation
                            data={formattedDataOther()}
                            avoidSrNo
                            columns={columnsOther}
                            hideSearchAndOtherButtons
                            dynamicPagination
                            itemsPerPage={pageSize}
                            pageNumber={currentPage}
                            onPageChange={handlePageChange}
                            totalPageNumber={totalPages}
                        />

                        <NormalReactTable data={summaryTableData} columns={summaryTableColumn} />
                    </>
                }
            </div>
        </AuthUserReusableCode >
    );
};

export default ReconciliationReport;
