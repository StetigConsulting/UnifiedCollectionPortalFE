'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { exportPicklist, formatDate, getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadCancelledTransactions, downloadTotalCollectionReport, getCancelledTransactions, getTotalCollectionReport } from '@/app/api-calls/report/api';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { getAgenciesWithDiscom, getAllPaymentModes, getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TotalCollectionReportFormData, totalCollectionReportSchema } from '@/lib/zod';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { getAllAgentByAgencyId } from '@/app/api-calls/agency/api';

const TotalCollectionReport = () => {
    const { data: session } = useSession()

    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [dataList, setDataList] = useState([]);

    const [showTable, setShowTable] = useState(false)

    const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<TotalCollectionReportFormData>({
        resolver: zodResolver(totalCollectionReportSchema),
        defaultValues: {
            workingLevel: null,
            circle: [],
            division: [],
            subDivision: [],
            section: [],
            pageSize: tableDataPerPage
        }
    });

    const formData = watch();

    const [pageSize, setPageSize] = useState(formData?.pageSize)

    const [agencyName, setAgencyName] = useState<string | null>(null);

    useEffect(() => {
        getWorkingLevel()
        // getReportData();
        getCircles(session?.user?.discomId)
    }, []);

    const [levelNameMappedWithId, setLevelNameMappedWithId] = useState<Record<string, number>>({})
    const [workingLevelList, setWorkingLevelList] = useState([]);
    const [exportType, setExportType] = useState('')

    const getWorkingLevel = async () => {
        setIsLoading(true)
        await getLevels(session?.user?.discomId).then((data) => {
            let levelIdMap = data?.data
                ?.filter((item) => item.levelType === "MAIN")
                .reduce((acc, item) => {
                    let levelName = item.levelName.replace(' ', "_");
                    acc[levelName] = item.id;
                    return acc;
                }, {});

            console.log(levelIdMap)
            setWorkingLevelList(data?.data
                ?.filter((item) => item.levelType === "MAIN")
                ?.map((item) => ({
                    label: item.levelName,
                    value: item.id,
                })));
            setLevelNameMappedWithId(levelIdMap)
        })
        setIsLoading(false)
    }

    const getReportData = async (applyFilter = {}, page = 1) => {

        let payload = {
            page: currentPage,
            page_size: formData?.pageSize,
            filter: {
                date_range: {
                    from_date: formData.fromDate,
                    to_date: formData.toDate
                },
                ...formData.workingLevel && {
                    office_structure_id: formData.workingLevel === levelNameMappedWithId.CIRCLE
                        ? formData?.circle?.map(Number)?.[0]
                        : formData.workingLevel === levelNameMappedWithId.DIVISION
                            ? formData?.division?.map(Number)?.[0]
                            : formData.workingLevel === levelNameMappedWithId.SUB_DIVISION
                                ? formData?.subDivision?.map(Number)?.[0]
                                : formData.workingLevel === levelNameMappedWithId.SECTION
                                    ? formData?.section?.map(Number)?.[0]
                                    : null,
                },
                ...formData?.agency && { agency_name: agencyName },
                ...formData?.agent && { agent_id: formData?.agent },
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
            const response = await getTotalCollectionReport(payload);
            setPageSize(formData?.pageSize);
            setShowTable(true)
            setDataList(response.data.data);
            setCurrentPage(page);
            setTotalPages(response.data.totalPages)
        } catch (error) {
            console.log(getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const columns = useMemo(() => [
        { label: 'Circle', key: 'level_1_name', sortable: true },
        { label: 'Division', key: 'level_2_name', sortable: true },
        { label: 'Sub Division', key: 'level_3_name', sortable: true },
        { label: 'Section', key: 'level_4_name', sortable: true },
        { label: 'Binder', key: 'binder', sortable: true },
        { label: 'MRU', key: 'mru', sortable: true },
        { label: 'Agency Name', key: 'agency_name', sortable: true },
        { label: 'Agent Name', key: 'agent_name', sortable: true },
        { label: 'Agent Mobile No', key: 'agent_mobile', sortable: true },
        { label: 'MPos Serial No.', key: 'm_pos_serial_no', sortable: true },
        { label: 'Consumer No', key: 'consumer_no', sortable: true },
        { label: 'Consumer Name', key: 'consumer_name', sortable: true },
        { label: 'Collection Type', key: 'collection_type', sortable: true },
        { label: 'Module Name', key: 'module_name', sortable: true },
        { label: 'Reference No', key: 'reference_no', sortable: true },
        { label: 'Installment No', key: 'installment_no', sortable: true },
        { label: 'Money Receipt No.', key: 'money_receipt_no', sortable: true },
        { label: 'Transaction ID', key: 'txn_id', sortable: true },
        { label: 'Transaction Date', key: 'transaction_date', sortable: true },
        { label: 'Transaction Time', key: 'transaction_time', sortable: true },
        { label: 'Transaction Amount', key: 'txn_amount', sortable: true },
        { label: 'Pay Mode', key: 'payment_mode', sortable: true },
        { label: 'Bank Name', key: 'dd_cheque_bank_name', sortable: true },
        { label: 'Payment Gateway', key: 'payment_gateway', sortable: true },
        { label: 'DD Check Details', key: 'dd_cheque_no', sortable: true },
        { label: 'Current Amount', key: 'current_amount', sortable: true },
        { label: 'Arrear Amount', key: 'arrear_amount', sortable: true },
        { label: 'Agent Type', key: 'agent_type', sortable: true },
        { label: 'Consumer Mobile No.', key: 'consumer_mobile_no', sortable: true },
        { label: 'Consumer Email ID', key: 'consumer_email', sortable: true },
        { label: 'Reasons', key: 'reason', sortable: true },
        { label: 'Remarks', key: 'remarks', sortable: true },
        { label: 'Server Date', key: 'upload_date', sortable: true },
        { label: 'Fg ID', key: 'fg_id', sortable: true },
        { label: 'Vendor ID', key: 'vendor_id', sortable: true },
    ], []);

    const formatData = dataList.map((item) => ({
        ...item,
        transaction_date: formatDate(item?.transaction_date),
        upload_date: formatDate(item?.upload_date),
    }))

    const getPayload = (data) => {

        let filter = {
            date_range: {
                from_date: data.fromDate,
                to_date: data.toDate
            },
            ...data.workingLevel && {
                office_structure_id: data.workingLevel === levelNameMappedWithId.CIRCLE
                    ? data?.circle?.map(Number)?.[0]
                    : data.workingLevel === levelNameMappedWithId.DIVISION
                        ? data?.division?.map(Number)?.[0]
                        : data.workingLevel === levelNameMappedWithId.SUB_DIVISION
                            ? data?.subDivision?.map(Number)?.[0]
                            : data.workingLevel === levelNameMappedWithId.SECTION
                                ? data?.section?.map(Number)?.[0]
                                : null,
            },
            ...formData?.agency && { agency_name: agencyName },
            ...formData?.agent && { agent_id: formData?.agent },
        }

        return filter
    }

    const onSubmit = (data) => {
        let payload = getPayload(data)
        getReportData(payload, 1);
    };

    const [circles, setCircles] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sections, setSections] = useState([]);

    const getCircles = async (id) => {
        setIsLoading(true)
        await getLevelsDiscomId(id).then((data) => {
            setCircles(
                data?.data?.officeStructure?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.office_description,
                    };
                })
            );
        }).finally(() => { setIsLoading(false); });
    };

    const getDivisions = async (id) => {
        setIsLoading(true)
        await getLevelsDiscomId(id).then((data) => {
            setDivisions(
                data?.data?.officeStructure?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.office_description,
                    };
                })
            );
        }).finally(() => { setIsLoading(false); });
    };

    const getSubDivisions = async (id) => {
        setIsLoading(true)
        await getLevelsDiscomId(id).then((data) => {
            setSubDivisions(
                data?.data?.officeStructure?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.office_description,
                    };
                })
            );
        }).finally(() => { setIsLoading(false); })
    };

    const getSections = async (id) => {
        setIsLoading(true)
        await getLevelsDiscomId(id).then((data) => {
            setSections(
                data?.data?.officeStructure?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.office_description,
                    };
                })
            );
        }).finally(() => { setIsLoading(false); });
    };

    const handleWorkingLevelChange = (selectedValue) => {
        if (!selectedValue.target.value) {
            setValue('workingLevel', null)
            setValue('circle', []);
            setValue('division', []);
            setValue('subDivision', []);
            setValue('section', []);
            return
        }
        setValue('workingLevel', parseInt(selectedValue.target.value))
        setValue('circle', []);
        setValue('division', []);
        setValue('subDivision', []);
        setValue('section', []);

        getCircles(session?.user?.discomId)
    }

    const handleCircleChange = (selectedValue) => {
        setValue('circle', selectedValue)
        setValue('division', []);
        setValue('subDivision', []);
        setValue('section', []);
        if (selectedValue.length > 0) {
            getDivisions(selectedValue?.[0])
        }
    }

    const handleDivisionChange = (selectedValue) => {
        setValue('division', selectedValue)
        setValue('subDivision', []);
        setValue('section', []);
        if (selectedValue.length > 0) {
            getSubDivisions(selectedValue?.[0])
        }
    }

    const handleSubDivisionChange = (selectedValue) => {
        setValue('subDivision', selectedValue)
        setValue('section', []);
        if (selectedValue.length > 0) {
            getSections(selectedValue?.[0])
        }
    }

    const handleSectionChange = (selectedValue) => {
        setValue('section', selectedValue)
    }

    const handleExportFile = async (data, type = 'pdf') => {
        setExportType(type)
        try {
            setIsLoading(true);
            let payload = getPayload(formData)
            const response = await downloadTotalCollectionReport(payload, type)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "TotalCollectionReport";

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
            console.log(err)
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
        let agencyDetails = agencyList.filter((item: any) => item.id === Number(agencyId))
        setAgencyName(prev => agencyDetails?.[0]?.agency_name || null);
        setValue('agency', agencyId);
        setValue('agent', '');
        if (agencyId)
            getAgentList(agencyId);
    }

    useEffect(() => {
        getAgencyList();
    }, []);

    return (
        <AuthUserReusableCode pageTitle="Total Collection" isLoading={isLoading}>
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
                    <CustomizedSelectInputWithLabel label='Applicable Level' list={workingLevelList}
                        {...register('workingLevel', { valueAsNumber: true })}
                        onChange={(e) => handleWorkingLevelChange(e)} errors={errors?.workingLevel} />
                    {formData.workingLevel != null && !isNaN(formData?.workingLevel) &&
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
                            {formData.workingLevel != null && formData.workingLevel != levelNameMappedWithId.CIRCLE && (
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
                            {
                                formData.workingLevel != null && (formData.workingLevel == levelNameMappedWithId.SECTION
                                    || formData.workingLevel == levelNameMappedWithId.SUB_DIVISION) && (
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
                                )
                            }
                            {
                                formData.workingLevel != null && formData.workingLevel == levelNameMappedWithId.SECTION && (
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
                                )
                            }
                        </>
                    }
                    <CustomizedSelectInputWithLabel
                        label='Agency' list={agencyList} {...register('agency', {
                            onChange: (e) => handleAgencySelect(e)
                        })} errors={errors.agency} />
                    <CustomizedSelectInputWithLabel label='Agent' list={agentList}
                        {...register('agent')} />
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
                    data={formatData}
                    columns={columns}
                    hideSearchAndOtherButtons
                    dynamicPagination
                    itemsPerPage={pageSize}
                    pageNumber={currentPage}
                    onPageChange={handlePageChange}
                    totalPageNumber={totalPages}
                // handleExportFile={handleExportFile}
                />}
            </div>
        </AuthUserReusableCode>
    );
};

export default TotalCollectionReport;
