'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { agentRolePicklist, agentWorkingType, dateTypePicklist, exportPicklist, formatDate, getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadDailyEnergyCollectionReport, downloadDeniedEnergyConsumerReport, getDailyEnergyCollectionReport, getDeniedEnergyConsumerReport } from '@/app/api-calls/report/api';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { getAgenciesWithDiscom, getAllPaymentModes, getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DeniedEnergyConsumerReportFormData, deniedEnergyConsumerReport } from '@/lib/zod';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import {  getDeniedToPayReason } from '@/app/api-calls/admin/api';

const DeniedEnergyConsumer = () => {
    const { data: session } = useSession()

    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [dataList, setDataList] = useState([]);
    const [showTable, setShowTable] = useState(false)
    const [deniedToPayReason, setDeniedToPayReason] = useState([])

    const { register, control, handleSubmit,
        clearErrors, formState: { errors }, watch, setValue }
        = useForm<DeniedEnergyConsumerReportFormData>({
            resolver: zodResolver(deniedEnergyConsumerReport),
            defaultValues: {
                workingLevel: null,
                circle: [],
                division: [],
                subDivision: [],
                section: [],
                pageSize: tableDataPerPage,
            }
        });

    useEffect(() => {
        getWorkingLevel()
        // getReportData();
        getCircles(session?.user?.discomId)
        getPicklistOfDeniedToPayReason()
    }, []);

    const getPicklistOfDeniedToPayReason = async () => {
        setIsLoading(true)
        await getDeniedToPayReason(session?.user?.discomId).then((data) => {
            setDeniedToPayReason(data?.data?.map((item) => ({
                label: item,
                value: item,
            })));
        }).finally(() => { setIsLoading(false); })
    }

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

            setWorkingLevelList(data?.data
                ?.filter((item) => item.levelType === "MAIN")
                ?.map((item) => ({
                    label: item.levelName,
                    value: item.id,
                })));
            setLevelNameMappedWithId(levelIdMap)
            setValue('levelWithIdMap', levelIdMap)
        })
        setIsLoading(false)
    }

    const getReportData = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: currentPage,
            page_size: formData?.pageSize,
            filter: {}
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
            const response = await getDeniedEnergyConsumerReport(payload);
            setDataList(response.data.data);
            setShowTable(true)
            setCurrentPage(page);
            setTotalPages(response.data.totalPages)
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const columns = useMemo(() => [
        { label: 'Circle', key: 'level_1_name', sortable: true },
        { label: 'Division', key: 'level_2_name', sortable: true },
        { label: 'Sub Division', key: 'level_3_name', sortable: true },
        { label: 'Section', key: 'level_4_name', sortable: true },
        { label: 'Binder', key: 'level_5_name', sortable: true },
        { label: 'MRU', key: 'level_6_name', sortable: true },
        { label: 'Agency Name', key: 'agency_name', sortable: true },
        { label: 'Agent Name', key: 'agent_name', sortable: true },
        { label: 'Agent Mobile No', key: 'agent_mobile', sortable: true },
        { label: 'Consumer No', key: 'consumer_no', sortable: true },
        { label: 'Consumer Name', key: 'consumer_name', sortable: true },
        { label: 'Bill Issue Date', key: 'bill_issue_date', sortable: true },
        { label: 'Due Date', key: 'due_date', sortable: true },
        { label: 'Amount', key: 'amount', sortable: true },
        { label: 'Merchant Ref No', key: 'merchant_ref_no', sortable: true },
        { label: 'Reason', key: 'reason', sortable: true },
        { label: 'Promise to pay date', key: 'promise_to_pay_date', sortable: true },
        { label: 'Remarks', key: 'remarks', sortable: true },
        { label: 'Entry Date', key: 'entry_date', sortable: true },
    ], []);

    const getPayload = (data) => {
        let filter = {
            ...(data?.fromDate && data?.toDate) && {
                date_range: {
                    from_date: data.fromDate,
                    to_date: data.toDate
                }
            },
            ...data?.deniedToPay && { denied_reason: data?.deniedToPay },
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
            }
        }
        return filter
    }

    const onSubmit = (data) => {
        const filter = getPayload(data)
        getReportData(filter, 1);
    };

    const formData = watch();

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
            clearErrors('workingLevel')
            setValue('circle', []);
            setValue('division', []);
            setValue('subDivision', []);
            setValue('section', []);
            return
        } else {
            setValue('workingLevel', parseInt(selectedValue.target.value))
            clearErrors('workingLevel')
            setValue('circle', []);
            setValue('division', []);
            setValue('subDivision', []);
            setValue('section', []);
        }
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
            const response = await downloadDeniedEnergyConsumerReport(payload, type)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "DeniedToPayConsumerEnergy";

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

    const handlePageChange = (page) => {
        setCurrentPage(page)
        let payload = getPayload(formData)
        getReportData(payload, page)
    }

    const formatData = dataList.map((item) => ({
        ...item,
        entry_date: item?.entry_date ? formatDate(item?.entry_date) : null,
        bill_issue_date: item?.bill_issue_date ? formatDate(item?.bill_issue_date) : null,
        due_date: item?.due_date ? formatDate(item?.due_date) : null,
        promise_to_pay_date: item?.promise_to_pay_date ? formatDate(item?.promise_to_pay_date) : null,
    }))


    return (
        <AuthUserReusableCode pageTitle="Denied to Pay Consumer Energy Report" isLoading={isLoading}>
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
                    <CustomizedSelectInputWithLabel label='Denied To Pay Reason' list={deniedToPayReason}
                        {...register('deniedToPay')} errors={errors.deniedToPay} />
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

                    <CustomizedInputWithLabel
                        label="Page Size"
                        type="number"
                        {...register('pageSize', { valueAsNumber: true })}
                        errors={errors.pageSize}
                    />

                    <div className={`mt-6`}>
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
                    itemsPerPage={tableDataPerPage}
                    pageNumber={currentPage}
                    onPageChange={handlePageChange}
                    totalPageNumber={totalPages}
                // handleExportFile={handleExportFile}
                />}
            </div>
        </AuthUserReusableCode>
    );
};

export default DeniedEnergyConsumer;
