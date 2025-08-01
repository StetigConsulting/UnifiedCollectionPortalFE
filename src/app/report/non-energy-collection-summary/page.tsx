'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { agentRolePicklist, dateTypePicklist, exportPicklist, getErrorMessage, tableDataPerPage, viewTypePicklist } from '@/lib/utils';
import { downloadDailyNonEnergyCollectionReport, downloadEnergyCollectionSummaryReport, energyCollectionSummaryReport, getDailyNonEnergyCollectionReport, nonEnergyCollectionSummaryReport } from '@/app/api-calls/report/api';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { getAgenciesWithDiscom, getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ViewCollectionSummarySchemaData, viewCollectionSummarySchema } from '@/lib/zod';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import ReactTableGroup from '@/components/ReactTableGroup';
import ReactGroupTable from '@/components/ReactTableGroup';

const NonEnergyCollectionSummary = () => {
    const { data: session } = useSession()

    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [dataList, setDataList] = useState([]);
    const [showTable, setShowTable] = useState(false)

    const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<ViewCollectionSummarySchemaData>({
        resolver: zodResolver(viewCollectionSummarySchema),
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
        getAgencyList()
        // getReportData();
        getCircles(session?.user?.discomId)
    }, []);

    const [levelNameMappedWithId, setLevelNameMappedWithId] = useState<Record<string, number>>({})
    const [workingLevelList, setWorkingLevelList] = useState([]);
    const [agencyList, setAgencyList] = useState([]);

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
            setValue('levelMapWithId', levelIdMap)
        })
        setIsLoading(false)
    }

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
            const response = await nonEnergyCollectionSummaryReport(payload);
            setShowTable(true)
            setDataList(response.data.data);
            setCurrentPage(page);
            setTotalPages(response.data.totalPages)
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const columns = useMemo(() => [
        { label: 'S.No', key: 'index', sortable: false },
        { label: 'Agency Name', key: 'agency_name', sortable: false },
        { label: 'Agency Id', key: 'agency_id', sortable: false },
        { label: 'Date / Month', key: 'date_month', sortable: false },
        { label: 'Total Txn', key: 'total_transaction', sortable: false },
        { label: 'Total Amount', key: 'total_amount', sortable: false, align: 'center' },
    ], []);

    const getPayload = (data) => {
        let filter = {
            ...data?.dateType === 'transaction_date' && {
                transaction_date_range: {
                    from_date: data.fromDate,
                    to_date: data.toDate
                }
            },
            ...data?.dateType === 'upload_date' && {
                upload_date_range: {
                    from_date: data.fromDate,
                    to_date: data.toDate
                }
            },
            ...data?.agencyName && { agency_name: data?.agencyName },
            ...data?.viewType && { summary_type: data?.viewType },
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
        return filter
    }

    const onSubmit = (data) => {
        let payload = getPayload(data)
        getReportData(payload, 1);
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
        try {
            setIsLoading(true);
            let payload = getPayload(formData)
            const response = await downloadDailyNonEnergyCollectionReport(payload, type)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "NonEnergyCollectionSummaryReport";

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
        }
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        let payload = getPayload(formData)
        getReportData(payload, page)
    }

    const formattedData = () => {
        let colors = ['#E9FEFE', '#FDFFE7']
        let colorIndex = 0
        let data = [];
        let index = 1;
        dataList?.map((item) => {
            let subdata = item?.collection_summary
                ?.map((subItem) => ({
                    index: index++,
                    agency_id: item.agency_id,
                    agency_name: item.agency_name,
                    total_amount: subItem.total_amount,
                    total_transaction: subItem.total_transaction,
                    date_month: subItem.date_month,
                    color: colors[colorIndex % 2]
                }))
            if (subdata?.length > 0) {
                data.push(...subdata)
            }
            data.push({
                index: 'TOTAL',
                agency_id: item.agency_id,
                agency_name: item.agency_name,
                total_amount: item.total_amount,
                total_transaction: item.total_transaction,
                date_month: item.date_month,
                color: colors[colorIndex % 2]
            })
            colorIndex++;
        })
        return data
    }

    return (
        <AuthUserReusableCode pageTitle="Non Energy Collection Summary" isLoading={isLoading}>
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
                    <CustomizedSelectInputWithLabel label='Date type' list={dateTypePicklist}
                        {...register('dateType')} errors={errors?.dateType} />
                    <CustomizedSelectInputWithLabel label='View type' list={viewTypePicklist}
                        {...register('viewType')} errors={errors?.viewType} />
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

                    <CustomizedSelectInputWithLabel label='Agency Name' list={agencyList}
                        {...register('agencyName')} errors={errors?.agencyName} />
                    <CustomizedInputWithLabel label='Page size' {...register('pageSize', { valueAsNumber: true })} errors={errors?.pageSize} />
                    <div className='mt-6'>
                        <Button variant='default' type='submit'>Search</Button>
                    </div>
                    <CustomizedSelectInputWithLabel
                        label="Export"
                        list={exportPicklist}
                        // value={transactionId}
                        onChange={(e) => {
                            const exportType = e.target.value;
                            handleSubmit((data) => handleExportFile(data, exportType))();
                        }}
                    />
                </div>
            </form>

            <div className="overflow-x-auto mb-4 mt-4">
                {showTable && <ReactGroupTable
                    data={formattedData()}
                    avoidSrNo
                    columns={columns}
                    hideSearchAndOtherButtons
                    dynamicPagination
                    itemsPerPage={tableDataPerPage}
                    pageNumber={currentPage}
                    onPageChange={handlePageChange}
                    totalPageNumber={totalPages}
                />}
            </div>
        </AuthUserReusableCode>
    );
};

export default NonEnergyCollectionSummary;
