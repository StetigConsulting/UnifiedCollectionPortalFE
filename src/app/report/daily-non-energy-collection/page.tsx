'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { agentRolePicklist, dateTypePicklist, exportPicklist, getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadDailyNonEnergyCollectionReport, getDailyNonEnergyCollectionReport } from '@/app/api-calls/report/api';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { getAgenciesWithDiscom, getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DailyCollectionNonEnergyFormData, dailyCollectionNonEnergySheet } from '@/lib/zod';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';

const DailyAgentCollection = () => {
    const { data: session } = useSession()

    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pageSize, setPageSize] = useState(tableDataPerPage);
    const [dataList, setDataList] = useState([]);

    const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<DailyCollectionNonEnergyFormData>({
        resolver: zodResolver(dailyCollectionNonEnergySheet),
        defaultValues: {
            workingLevel: null,
            circle: [],
            division: [],
            subDivision: [],
            section: [],
        }
    });

    useEffect(() => {
        getWorkingLevel()
        getAgencyList()
        getReportData();
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

    const getAgencyList = async () => {
        setIsLoading(true)
        await getAgenciesWithDiscom(session?.user?.discomId).then(data => {
            setAgencyList(data?.data?.map((item) => ({
                label: item.agency_name,
                value: item.id,
            })))
        })
        setIsLoading(false)
    }

    const getReportData = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: currentPage,
            page_size: pageSize,
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
            const response = await getDailyNonEnergyCollectionReport(payload);
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
        { label: 'Agent Mobile No', key: 'agentMobileNo', sortable: true },
        { label: 'MPOS Serial no', key: 'MposSerialNo', sortable: true },
        { label: 'Module Name', key: 'module_name', sortable: true },
    ], []);

    const onSubmit = (data) => {
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
            ...data?.agent_role && { agent_role: data?.agentRole },
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

    const handleExportFile = async (type = 'pdf') => {
        try {
            setIsLoading(true);
            let payload = {}
            const response = await downloadDailyNonEnergyCollectionReport(payload, type)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "DailyNonEnergyCollectionReport";

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
            a.download = `${filename}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading the report:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthUserReusableCode pageTitle="Daily Non Energy Collection" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4">
                <div className="grid grid-cols-6 gap-4 flex-grow">
                    <CustomizedInputWithLabel
                        label="From Date"
                        type="date"
                        {...register('fromDate')}
                    />
                    <CustomizedInputWithLabel
                        label="To Date"
                        type="date"
                        {...register('toDate')}
                    />
                    <CustomizedSelectInputWithLabel label='Date type' list={dateTypePicklist}
                        {...register('dateType')} />
                    <CustomizedSelectInputWithLabel label='Agent role' list={agentRolePicklist}
                        {...register('agentRole')} />
                    <CustomizedSelectInputWithLabel label='Working level' list={workingLevelList}
                        {...register('workingLevel')} onChange={(e) => handleWorkingLevelChange(e)} />
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

                    <CustomizedSelectInputWithLabel label='Agency Name' list={agencyList} {...register('agencyName')} />
                    <div className='self-end mb-1'>
                        <Button variant='default' type='submit'>Search</Button>
                    </div>
                    <CustomizedSelectInputWithLabel
                        label="Export"
                        list={exportPicklist}
                        // value={transactionId}
                        onChange={(e) => handleExportFile(e.target.value)}
                    />
                </div>

            </form>

            <div className="overflow-x-auto mb-4 mt-4">
                <ReactTable
                    data={dataList}
                    columns={columns}
                    hideSearchAndOtherButtons
                />
            </div>
        </AuthUserReusableCode>
    );
};

export default DailyAgentCollection;
