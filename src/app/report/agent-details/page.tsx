'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { agencyStatusType, exportPicklist, formatDate, getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadAgentDetailsReport, downloadBillingReport, getAgentDetailsReport, getBillingReport } from '@/app/api-calls/report/api';
import { useSession } from 'next-auth/react';
import { AgentDetailsReportFormData, agentDetailsReportSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { getAgenciesWithDiscom } from '@/app/api-calls/department/api';

const AgentDetails = () => {

    const { data: session } = useSession()
    const currentUserId = session?.user?.userId
    const [isLoading, setIsLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pageSize, setPageSize] = useState(tableDataPerPage)

    const [dataList, setDataList] = useState([])

    const [showTable, setShowTable] = useState(false)

    const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<AgentDetailsReportFormData>({
        resolver: zodResolver(agentDetailsReportSchema),
        defaultValues: {
            pageSize: tableDataPerPage
        }
    });

    const [agencyList, setAgencyList] = useState([]);

    const getAgencyList = async () => {
        setIsLoading(true)
        await getAgenciesWithDiscom(session?.user?.discomId).then(data => {
            setAgencyList(data?.data?.map((item) => ({
                label: item.agency_name,
                value: item.agency_name,
            })))
        })
        setIsLoading(false)
    }

    useEffect(() => {
        getAgencyList();
        getReportData({}, 1)
    }, []);

    const getReportData = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: currentPage,
            page_size: formData?.pageSize,
            filter: {
                ...formData?.agency && { agency_name: formData?.agency },
                ...formData?.agencyStatus && { is_active: formData?.agencyStatus === 'Active' ? true : false },
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
            const response = await getAgentDetailsReport(payload);
            setDataList(response.data.data);
            setShowTable(true)
            setCurrentPage(page);
            setTotalPages(response.data.totalPages)
            setIsLoading(false);
        } catch (error) {
            console.log(getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const formatData = dataList.map(item => ({
        ...item,
        validity_start_date: formatDate(item.validity_start_date),
        validity_end_date: formatDate(item.validity_end_date),
        activation_date: formatDate(item?.activation_date),
        agent_created_on: formatDate(item?.agent_created_on),
        // last_login_date_time: formatDate(item.last_login_date_time),
        // last_sync_date_time: formatDate(item.last_sync_date_time),
    }))

    const columns = useMemo(() => [
        { label: 'Agency Name', key: 'agency_name', sortable: true },
        { label: 'Agent Name', key: 'agent_name', sortable: true },
        { label: 'Agent Mobile No', key: 'agent_mobile', sortable: true },
        { label: 'Agent Id', key: 'agent_id', sortable: true },
        { label: 'Office Code', key: 'office_code', sortable: true },
        { label: 'Office Name', key: 'office_name', sortable: true },
        { label: 'Validity Start Date', key: 'validity_start_date', sortable: true },
        { label: 'Validity End Date', key: 'validity_end_date', sortable: true },
        { label: 'Status', key: 'agent_status', sortable: true },
        { label: 'Collection Mode', key: 'agent_collection_mode', sortable: true },
        { label: 'Role', key: 'agent_role', sortable: true },
        { label: 'Agent Type', key: 'agent_type', sortable: true },
        { label: 'Payment Modes Allowed', key: 'payment_modes_allowed', sortable: true },
        { label: 'Collection Types Allowed', key: 'collection_types_allowed', sortable: true },
        { label: 'Activation Date', key: 'activation_date', sortable: true },
        { label: 'Device Id', key: 'device_id', sortable: true },
        { label: 'Device Model', key: 'device_model', sortable: true },
        { label: 'Device Make', key: 'device_make', sortable: true },
        { label: 'Device Serial No', key: 'device_serial_no', sortable: true },
        { label: 'Agent Created By', key: 'agent_created_by', sortable: true },
        { label: 'Agent Created On', key: 'agent_created_on', sortable: true },
        { label: 'Last Login Date Time', key: 'last_login_date_time', sortable: true },
        { label: 'Last Sync Date Time', key: 'last_sync_date_time', sortable: true },
    ], []);

    const [exportType, setExportType] = useState('')

    const getPayload = (data) => {
        let filter = {
            page: currentPage,
            page_size: formData?.pageSize,
            filter: {
                ...formData?.agency && { agency_name: formData?.agency },
                ...formData?.agencyStatus && { is_active: formData?.agencyStatus === 'Active' ? true : false },
            }
        }

        setPageSize(formData?.pageSize)
        return filter;
    }

    const handleExportFile = async (data, type = 'pdf') => {
        setExportType(type)
        try {
            setIsLoading(true);
            let payload = getPayload(formData)
            const response = await downloadAgentDetailsReport(payload, type)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "AgentDetailsReport";

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

    const handlePageChange = (page: number) => {
        getReportData({}, page)
    };

    const onSubmit = (data) => {
        getReportData({}, 1);
    };

    const formData = watch()

    return (
        <AuthUserReusableCode pageTitle="Agent Details Report" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4">
                <div className="grid grid-cols-5 gap-4 flex-grow">
                    <CustomizedSelectInputWithLabel
                        label='Agency' list={agencyList} {...register('agency')} errors={errors.agency} />
                    <CustomizedSelectInputWithLabel label='Agency Status' list={agencyStatusType}
                        {...register('agencyStatus')} />
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
                    data={formatData}
                    columns={columns}
                    dynamicPagination
                    itemsPerPage={pageSize}
                    pageNumber={currentPage}
                    totalPageNumber={totalPages}
                    onPageChange={handlePageChange}
                    hideSearchAndOtherButtons
                />
            </div>}
        </AuthUserReusableCode>
    );
};

export default AgentDetails;
