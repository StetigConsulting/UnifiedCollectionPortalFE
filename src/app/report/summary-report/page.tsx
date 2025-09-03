'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { getErrorMessage, tableDataPerPage, exportPicklist, summaryReportTypePicklist } from '@/lib/utils';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { getSummaryReport, downloadSummaryReport } from '@/app/api-calls/report/api';
import { getCollectorTypes } from '@/app/api-calls/agency/api';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SummaryReportData, summaryReportSchema } from '@/lib/zod';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { toast } from 'sonner';

const SummaryReport = () => {
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [dataList, setDataList] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [exportType, setExportType] = useState('');
    const [collectorTypeList, setCollectorTypeList] = useState([]);

    const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<SummaryReportData>({
        resolver: zodResolver(summaryReportSchema),
        defaultValues: {
            applicableLevel: null,
            circle: [],
            division: [],
            subDivision: [],
            section: [],
            pageSize: tableDataPerPage
        }
    });

    useEffect(() => {
        getWorkingLevel();
        getCircles(session?.user?.discomId);
        getCollectorTypePicklist();
    }, []);

    const [levelNameMappedWithId, setLevelNameMappedWithId] = useState<Record<string, number>>({});
    const [workingLevelList, setWorkingLevelList] = useState([]);

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

            setValue('levelWithIdMap', levelIdMap);

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

    const getCollectorTypePicklist = async () => {
        setIsLoading(true);
        await getCollectorTypes().then((data) => {
            setCollectorTypeList(data?.data?.map((item) => ({
                label: item?.name,
                value: item?.id,
            })));
        }).finally(() => { setIsLoading(false); });
    };

    const getReportData = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: page,
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
        };

        try {
            setIsLoading(true);
            const response = await getSummaryReport(payload);
            setShowTable(true);
            setDataList(response.data.data);
            setCurrentPage(page);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };



    const columns = useMemo(() => [
        { label: 'CIRCLE', key: 'circle', sortable: true },
        { label: 'DIVISION', key: 'division', sortable: true },
        { label: 'SUBDIVISION', key: 'subdivision', sortable: true },
        { label: 'SECTION', key: 'section', sortable: true },
        { label: 'AGENCY NAME', key: 'agency_name', sortable: true },
        { label: 'COL TYPE', key: 'col_type', sortable: true },
        { label: 'USERID', key: 'userid', sortable: true },
        { label: 'COLLECTOR NAME', key: 'collector_name', sortable: true },
    ], []);

    const getPayload = (data) => {
        let filter = {
            date_range: {
                from_date: data.fromDate,
                to_date: data.toDate
            },
            report_type: data.reportType,
            ...data.collectorType && {
                collector_type_id: data.collectorType
            },
            ...data.applicableLevel && {
                office_structure_id: data.applicableLevel === levelNameMappedWithId.CIRCLE
                    ? data?.circle?.map(Number)?.[0]
                    : data.applicableLevel === levelNameMappedWithId.DIVISION
                        ? data?.division?.map(Number)?.[0]
                        : data.applicableLevel === levelNameMappedWithId.SUB_DIVISION
                            ? data?.subDivision?.map(Number)?.[0]
                            : data.applicableLevel === levelNameMappedWithId.SECTION
                                ? data?.section?.map(Number)?.[0]
                                : null,
            }
        };
        return filter;
    };

    const onSubmit = (data) => {
        let payload = getPayload(data);
        getReportData(payload, 1);
    };

    const formData = watch();

    const [circles, setCircles] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sections, setSections] = useState([]);

    const getCircles = async (id) => {
        setIsLoading(true);
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
        setIsLoading(true);
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
        setIsLoading(true);
        await getLevelsDiscomId(id).then((data) => {
            setSubDivisions(
                data?.data?.officeStructure?.map((ite) => {
                    return {
                        value: ite.id,
                        label: ite.office_description,
                    };
                })
            );
        }).finally(() => { setIsLoading(false); });
    };

    const getSections = async (id) => {
        setIsLoading(true);
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
            setValue('applicableLevel', null);
            setValue('circle', []);
            setValue('division', []);
            setValue('subDivision', []);
            setValue('section', []);
            return;
        }
        setValue('applicableLevel', parseInt(selectedValue.target.value));
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

    const handleExportFile = async (data, type = 'csv') => {
        setExportType(type);
        try {
            setIsLoading(true);
            let payload = getPayload(formData);
            
            const response = await downloadSummaryReport(payload, type);
            
            const contentDisposition = response.headers["content-disposition"];
            let filename = "SummaryReport";

            if (contentDisposition) {
                const matches = contentDisposition.match(/filename="(.+)"/);
                if (matches && matches.length > 1) {
                    filename = matches[1];
                }
            }

            const contentType = response.headers["content-type"] || "application/octet-stream";
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
            setExportType('');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        let payload = getPayload(formData);
        getReportData(payload, page);
    };

    return (
        <AuthUserReusableCode pageTitle="Summary Report" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4">
                <div className="grid grid-cols-6 gap-4 flex-grow">
                    <CustomizedInputWithLabel
                        label="From Date *"
                        type="date"
                        {...register('fromDate')}
                        errors={errors.fromDate}
                    />
                    <CustomizedInputWithLabel
                        label="To Date *"
                        type="date"
                        {...register('toDate')}
                        errors={errors.toDate}
                    />
                    <CustomizedSelectInputWithLabel 
                        label='Applicable Level' 
                        list={workingLevelList}
                        {...register('applicableLevel', { valueAsNumber: true })}
                        onChange={(e) => handleWorkingLevelChange(e)} 
                        errors={errors?.applicableLevel} 
                    />
                    {formData.applicableLevel != null && !isNaN(formData?.applicableLevel) &&
                        <>
                            <CustomizedMultipleSelectInputWithLabelNumber
                                label="Circle"
                                errors={errors.circle}
                                required={true}
                                list={circles}
                                placeholder="Select Circle"
                                value={watch('circle') || []}
                                onChange={(selectedValues) => handleCircleChange(selectedValues)}
                            />
                            {formData.applicableLevel != null && formData.applicableLevel != levelNameMappedWithId.CIRCLE && (
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
                                formData.applicableLevel != null && (formData.applicableLevel == levelNameMappedWithId.SECTION
                                    || formData.applicableLevel == levelNameMappedWithId.SUB_DIVISION) && (
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
                                formData.applicableLevel != null && formData.applicableLevel == levelNameMappedWithId.SECTION && (
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
                        label='Report Type *' 
                        list={summaryReportTypePicklist}
                        {...register('reportType', { onChange: () => setShowTable(false) })} 
                        errors={errors?.reportType} 
                    />
                    <CustomizedSelectInputWithLabel 
                        label='Collector Type' 
                        list={collectorTypeList}
                        {...register('collectorType', { valueAsNumber: true })} 
                        errors={errors?.collectorType} 
                    />
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
                    <CustomizedInputWithLabel 
                        label='Page Size'
                        {...register('pageSize', { valueAsNumber: true })} 
                        errors={errors?.pageSize} 
                    />

                    <div className='self-end mb-1'>
                        <Button variant='default' type='submit'>Search</Button>
                    </div>
                </div>
            </form>

            <div className="overflow-x-auto mb-4 mt-4">
                {showTable && <ReactTable
                    data={dataList}
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

export default SummaryReport;
