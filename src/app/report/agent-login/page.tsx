'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { agencyStatusType, exportPicklist, exportPicklistWithPdf, formatDate, getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadAgentDetailsReport, downloadAgentLoginReport, downloadBillingReport, getAgentDetailsReport, getAgentLoginReport, getBillingReport } from '@/app/api-calls/report/api';
import { useSession } from 'next-auth/react';
import { AgentLoginReportFormData, agentLoginReportSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { getAgenciesWithDiscom } from '@/app/api-calls/department/api';
import { getAllAgentByAgencyId } from '@/app/api-calls/agency/api';

const AgentLoginReport = () => {

    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false);

    const [dataList, setDataList] = useState([])

    const [showTable, setShowTable] = useState(false)

    const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<AgentLoginReportFormData>({
        resolver: zodResolver(agentLoginReportSchema),
        defaultValues: {

        }
    });

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
        } finally {
            setIsLoading(false)
        }
    }

    const [agentList, setAgentList] = useState([]);

    const getAgentList = async (agencyId: number) => {
        setIsLoading(true);
        try {
            const response = await getAllAgentByAgencyId(agencyId);
            setAgentList(
                response?.data?.map((item) => ({
                    label: `${item?.agent_name} - ${item?.primary_phone}`,
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
        setValue('agency', agencyId);
        setValue('agent', '');
        setAgentList([]);
        if (agencyId)
            getAgentList(agencyId);
    }

    useEffect(() => {
        getAgencyList();
    }, []);

    const getReportData = async (applyFilter = {}, page = 1) => {

        let agencyDetails = agencyList.filter((item: any) => item.id === Number(formData?.agency))

        let payload = {
            date_range: {
                from_date: formData?.fromDate,
                to_date: formData?.toDate
            },
            ...formData?.agency && { agency_name: agencyDetails?.[0]?.agency_name },
            ...formData?.agent && { agent_id: formData?.agent },
        }

        payload = {
            ...payload,
            ...applyFilter
        }

        try {
            setIsLoading(true);
            const response = await getAgentLoginReport(payload);
            setDataList(response.data.data);
            setOverflowDataMessage(response?.data?.overflowDataMessage)
            setShowTable(true)
            setIsLoading(false);
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const formatData = dataList.map(item => ({
        ...item,
        login_date: formatDate(item.login_date),
    }))

    const columns = useMemo(() => [
        { label: 'Login Date', key: 'login_date', sortable: true },
        { label: 'Agency Name', key: 'agency_name', sortable: true },
        { label: 'Agent Id', key: 'agent_id', sortable: true },
        { label: 'Agent Mobile No', key: 'agent_mobile', sortable: true },
        { label: 'Agent Name', key: 'agent_name', sortable: true },
        { label: 'Login Date Time', key: 'login', sortable: true },
        { label: 'Logout Date Time', key: 'logout', sortable: true },
    ], []);

    const [exportType, setExportType] = useState('')

    const getPayload = (data) => {
        let agencyDetails = agencyList.filter((item: any) => item.id === Number(formData?.agency))

        let payload = {
            date_range: {
                from_date: formData?.fromDate,
                to_date: formData?.toDate
            },
            ...formData?.agency && { agency_name: agencyDetails?.[0]?.agency_name },
            ...formData?.agent && { agent_id: formData?.agent },
        }

        return payload;
    }

    const [overflowDataMessage, setOverflowDataMessage] = useState(null)

    const handleExportFile = async (data, type = 'pdf') => {
        setExportType(type)
        try {
            setIsLoading(true);
            let payload = getPayload(formData)
            const response = await downloadAgentLoginReport(payload, type)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "AgentLoginReport";

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
        <AuthUserReusableCode pageTitle="Agent Login Report" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4">
                <div className="grid grid-cols-6 gap-4 flex-grow">
                    <CustomizedInputWithLabel label='From Date' {...register('fromDate')}
                        type='date' errors={errors?.fromDate} />
                    <CustomizedInputWithLabel label='To Date' {...register('toDate')}
                        type='date' errors={errors?.toDate} />
                    <CustomizedSelectInputWithLabel
                        label='Agency' list={agencyList} {...register('agency', {
                            onChange: (e) => handleAgencySelect(e)
                        })} errors={errors.agency} />
                    <CustomizedSelectInputWithLabel label='Agent' list={agentList}
                        {...register('agent')} />

                    <div className='mt-6'>
                        <Button variant='default' type='submit'>Search</Button>
                    </div>
                    <CustomizedSelectInputWithLabel
                        label="Export"
                        placeholder='Export to'
                        list={exportPicklistWithPdf}
                        value={exportType}
                        onChange={(e) => {
                            const exportType = e.target.value;
                            handleSubmit((data) => handleExportFile(data, exportType))();
                        }}
                    />
                    {
                        (overflowDataMessage && showTable) &&
                        <div className='col-span-6 text-center'>
                            <span className='m-auto bg-[#FD9292] border border-[#FF0000] text-black text-sm rounded-lg px-4 py-2'>Note: {overflowDataMessage}</span>
                        </div>
                    }
                </div>
            </form>
            {showTable && <div className="overflow-x-auto mt-4">
                <ReactTable
                    data={formatData}
                    columns={columns}
                    hideSearchAndOtherButtons
                />
            </div>}
        </AuthUserReusableCode>
    );
};

export default AgentLoginReport;
