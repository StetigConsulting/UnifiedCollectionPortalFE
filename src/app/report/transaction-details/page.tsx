'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { formatDate, tableDataPerPage, exportPicklist, getErrorMessage } from '@/lib/utils';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getTransactionDetailsReport, downloadTransactionDetailsReport } from '@/app/api-calls/report/api';
import { getAgenciesWithDiscom, getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { getAllAgentByAgencyId } from '@/app/api-calls/agency/api';
import { TransactionDetailsReportFormData, transactionDetailsReportSchema } from '@/lib/zod';

const TransactionDetailsReport = () => {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [dataList, setDataList] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [workingLevelList, setWorkingLevelList] = useState([]);
    const [levelNameMappedWithId, setLevelNameMappedWithId] = useState<Record<string, number>>({});
    const [agencyList, setAgencyList] = useState([]);
    const [agentList, setAgentList] = useState([]);
    const [circles, setCircles] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sections, setSections] = useState([]);
    const [pageSize, setPageSize] = useState(tableDataPerPage);
    const [exportType, setExportType] = useState('');
    const [agencyName, setAgencyName] = useState<string | null>(null);

    const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<TransactionDetailsReportFormData>({
        resolver: zodResolver(transactionDetailsReportSchema),
        defaultValues: {
            workingLevel: null,
            circle: [],
            division: [],
            subDivision: [],
            section: [],
            pageSize: tableDataPerPage,
        },
    });

    const formData = watch();

    useEffect(() => {
        getWorkingLevel();
        getCircles(session?.user?.discomId);
        getAgencyList();
    }, []);

    const getWorkingLevel = async () => {
        setIsLoading(true);
        await getLevels(session?.user?.discomId).then((data) => {
            let levelIdMap = data?.data
                ?.filter((item) => item.levelType === "MAIN")
                .reduce((acc, item) => {
                    let levelName = item.levelName.replace(' ', "_");
                    acc[levelName] = item.id;
                    return acc;
                }, {});
            setWorkingLevelList(data?.data
                ?.filter((item) => item.levelType === "MAIN")
                ?.map((item) => ({
                    label: item.levelName,
                    value: item.id,
                })));
            setLevelNameMappedWithId(levelIdMap);
        });
        setIsLoading(false);
    };

    const getCircles = async (id) => {
        setIsLoading(true);
        await getLevelsDiscomId(id).then((data) => {
            setCircles(
                data?.data?.officeStructure?.map((ite) => ({
                    value: ite.id,
                    label: ite.office_description,
                }))
            );
        }).finally(() => { setIsLoading(false); });
    };

    const getDivisions = async (id) => {
        setIsLoading(true);
        await getLevelsDiscomId(id).then((data) => {
            setDivisions(
                data?.data?.officeStructure?.map((ite) => ({
                    value: ite.id,
                    label: ite.office_description,
                }))
            );
        }).finally(() => { setIsLoading(false); });
    };

    const getSubDivisions = async (id) => {
        setIsLoading(true);
        await getLevelsDiscomId(id).then((data) => {
            setSubDivisions(
                data?.data?.officeStructure?.map((ite) => ({
                    value: ite.id,
                    label: ite.office_description,
                }))
            );
        }).finally(() => { setIsLoading(false); });
    };

    const getSections = async (id) => {
        setIsLoading(true);
        await getLevelsDiscomId(id).then((data) => {
            setSections(
                data?.data?.officeStructure?.map((ite) => ({
                    value: ite.id,
                    label: ite.office_description,
                }))
            );
        }).finally(() => { setIsLoading(false); });
    };

    const handleWorkingLevelChange = (selectedValue) => {
        if (!selectedValue.target.value) {
            setValue('workingLevel', null);
            setValue('circle', []);
            setValue('division', []);
            setValue('subDivision', []);
            setValue('section', []);
            return;
        }
        setValue('workingLevel', parseInt(selectedValue.target.value));
        setValue('circle', []);
        setValue('division', []);
        setValue('subDivision', []);
        setValue('section', []);
        getCircles(session?.user?.discomId);
    };

    const handleCircleChange = (selectedValue) => {
        setValue('circle', selectedValue);
        setValue('division', []);
        setValue('subDivision', []);
        setValue('section', []);
        if (selectedValue.length > 0) {
            getDivisions(selectedValue?.[0]);
        }
    };

    const handleDivisionChange = (selectedValue) => {
        setValue('division', selectedValue);
        setValue('subDivision', []);
        setValue('section', []);
        if (selectedValue.length > 0) {
            getSubDivisions(selectedValue?.[0]);
        }
    };

    const handleSubDivisionChange = (selectedValue) => {
        setValue('subDivision', selectedValue);
        setValue('section', []);
        if (selectedValue.length > 0) {
            getSections(selectedValue?.[0]);
        }
    };

    const handleSectionChange = (selectedValue) => {
        setValue('section', selectedValue);
    };

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId);
            setAgencyList(response?.data?.map((item) => ({
                ...item,
                label: `${item?.agency_name} - ${item?.phone}`,
                value: item?.id,
            })));
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getAgentList = async (agencyId) => {
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
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAgencySelect = (e) => {
        const agencyId = e.target.value;
        let agencyDetails = agencyList.filter((item) => item.id === Number(agencyId));
        setAgencyName(agencyDetails?.[0]?.agency_name || null);
        setValue('agency', agencyId);
        setValue('agent', '');
        if (agencyId) getAgentList(agencyId);
    };

    const buildTransactionDetailsPayload = (data, page = 1, includePagination = true) => {
        const filter = {
            transaction_date_range: {
                from_date: data.fromDate,
                to_date: data.toDate,
            },
            ...(data.agency && { agency_name: agencyName }),
            ...(data.agent && { agent_id: data.agent }),
            ...data.workingLevel && {
                office_structure_id: data.workingLevel === levelNameMappedWithId['CIRCLE']
                    ? data?.circle?.map(Number)?.[0]
                    : data.workingLevel === levelNameMappedWithId['DIVISION']
                        ? data?.division?.map(Number)?.[0]
                        : data.workingLevel === levelNameMappedWithId['SUB_DIVISION']
                            ? data?.subDivision?.map(Number)?.[0]
                            : data.workingLevel === levelNameMappedWithId['SECTION']
                                ? data?.section?.map(Number)?.[0]
                                : null,
            }
        }
        if (includePagination) {
            return {
                page: page,
                page_size: data.pageSize || tableDataPerPage,
                filter,
            };
        } else {
            return filter;
        }
    };

    const fetchTransactionDetails = async (filters, page = 1) => {
        setIsLoading(true);
        try {
            const payload = buildTransactionDetailsPayload(filters, page, true);
            const response = await getTransactionDetailsReport(payload);
            setDataList(response.data.data || []);
            console.log(response.data.data);
            setShowTable(true);
            setCurrentPage(page);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            toast.error('Error:', getErrorMessage(error));
            setShowTable(false);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'Agency Mobile No.', key: 'agency_mobile', sortable: true },
        { label: 'Agency Name', key: 'agency_name', sortable: true },
        { label: 'Collector Mobile No.', key: 'collector_mobile', sortable: true },
        { label: 'Collector Name', key: 'collector_name', sortable: true },
        { label: 'Consumer No.', key: 'consumer_no', sortable: true },
        { label: 'Consumer Name', key: 'consumer_name', sortable: true },
        { label: 'Transaction Date and Time', key: 'transaction_date_time', sortable: true },
        { label: 'Transaction Amount', key: 'transaction_amount', sortable: true },
    ], []);

    const onSubmit = (data) => {
        fetchTransactionDetails(data, 1);
    };

    const handlePageChange = (page) => {
        fetchTransactionDetails(formData, page);
    };

    const handleExportFile = async (data, type = 'csv') => {
        setExportType(type);
        try {
            setIsLoading(true);
            const payload = buildTransactionDetailsPayload(data, 1, false);
            const response = await downloadTransactionDetailsReport(payload, type);
            const contentDisposition = response.headers["content-disposition"];
            let filename = "TransactionDetailsReport";
            if (contentDisposition) {
                const matches = contentDisposition.match(/filename="(.+)"/);
                if (matches && matches.length > 1) {
                    filename = matches[1];
                }
            }
            const contentType = response.headers["content-type"];
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
            toast.error("Error downloading the report");
        } finally {
            setIsLoading(false);
            setExportType('');
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Transaction Details" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4">
                <div className="grid grid-cols-6 gap-4 flex-grow">
                    <CustomizedInputWithLabel
                        label="From Date"
                        type="date"
                        required
                        {...register('fromDate')}
                        errors={errors.fromDate}
                    />
                    <CustomizedInputWithLabel
                        label="To Date"
                        type="date"
                        required
                        {...register('toDate')}
                        errors={errors.toDate}
                    />
                    <CustomizedSelectInputWithLabel
                        label='Applicable Level'
                        list={workingLevelList}
                        {...register('workingLevel', { valueAsNumber: true })}
                        onChange={(e) => handleWorkingLevelChange(e)}
                        errors={errors?.workingLevel}
                    />
                    {formData.workingLevel != null && !isNaN(formData?.workingLevel) && (
                        <>
                            <CustomizedMultipleSelectInputWithLabelNumber
                                label="Circle"
                                errors={errors.circle}
                                required={true}
                                list={circles}
                                placeholder="Select Circle Type"
                                value={watch('circle') || []}
                                onChange={(selectedValues) => handleCircleChange(selectedValues)}
                            />
                            {formData.workingLevel != null && formData.workingLevel != levelNameMappedWithId['CIRCLE'] && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Division"
                                    required={true}
                                    list={divisions}
                                    disabled={formData?.circle?.length == 0}
                                    value={watch('division') || []}
                                    onChange={(selectedValues) => handleDivisionChange(selectedValues)}
                                    errors={errors.division}
                                />
                            )}
                            {(formData.workingLevel != null && (formData.workingLevel == levelNameMappedWithId['SECTION'] || formData.workingLevel == levelNameMappedWithId['SUB_DIVISION'])) && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Sub Division"
                                    errors={errors.subDivision}
                                    placeholder="Select Sub Division"
                                    list={subDivisions}
                                    required={true}
                                    disabled={formData?.division?.length == 0}
                                    value={watch('subDivision') || []}
                                    onChange={(selectedValues) => handleSubDivisionChange(selectedValues)}
                                />
                            )}
                            {formData.workingLevel != null && formData.workingLevel == levelNameMappedWithId['SECTION'] && (
                                <CustomizedMultipleSelectInputWithLabelNumber
                                    label="Section"
                                    errors={errors.section}
                                    placeholder="Select Section"
                                    list={sections}
                                    required={true}
                                    disabled={formData?.subDivision?.length == 0}
                                    value={watch('section') || []}
                                    onChange={(selectedValues) => handleSectionChange(selectedValues)}
                                />
                            )}
                        </>
                    )}
                    <CustomizedSelectInputWithLabel
                        label='Agency'
                        list={agencyList}
                        {...register('agency', {
                            onChange: (e) => handleAgencySelect(e)
                        })}
                        errors={errors.agency}
                    />
                    <CustomizedSelectInputWithLabel
                        label='Agent'
                        list={agentList}
                        {...register('agent')}
                        errors={errors.agent}
                    />
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
            <div className="overflow-x-auto mb-4 mt-4">
                {showTable && <ReactTable
                    data={dataList}
                    columns={columns}
                    hideSearchAndOtherButtons
                    dynamicPagination
                    itemsPerPage={pageSize}
                    pageNumber={currentPage}
                    onPageChange={handlePageChange}
                    totalPageNumber={totalPages}
                />}
            </div>
        </AuthUserReusableCode>
    );
};

export default TransactionDetailsReport; 