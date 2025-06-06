'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { exportPicklist, formatDate, getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { downloadAgentAttendance, downloadDeniedEnergyConsumerReport, getAgentAttendance } from '@/app/api-calls/report/api';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AgentAttendanceReportFormData, agentAttendanceReport } from '@/lib/zod';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import { getCollectorTypes } from '@/app/api-calls/agency/api';

const AgentAttendanceReport = () => {
    const { data: session } = useSession()

    const [isLoading, setIsLoading] = useState(false);
    // const [currentPage, setCurrentPage] = useState(1)
    // const [totalPages, setTotalPages] = useState(1)
    const [dataList, setDataList] = useState([]);
    const [showTable, setShowTable] = useState(false)
    const [agentTypePicklist, setAgentTypePicklist] = useState([])
    const [overflowDataMessage, setOverflowDataMessage] = useState('')

    const { register, control, handleSubmit,
        clearErrors, formState: { errors }, watch, setValue }
        = useForm<AgentAttendanceReportFormData>({
            resolver: zodResolver(agentAttendanceReport),
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
        getPicklist()
    }, []);

    const getPicklist = async () => {
        setIsLoading(true)
        await getCollectorTypes().then((data) => {
            setAgentTypePicklist(data?.data?.map((item) => ({
                label: item?.name,
                value: item?.id,
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

            console.log(levelIdMap)
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
        };

        payload = {
            ...payload,
            ...applyFilter
        }

        try {
            setIsLoading(true);
            const response = await getAgentAttendance(payload);
            setDataList(response.data.data);
            setShowTable(true)
            setOverflowDataMessage(response.overflowDataMessage)
            // setCurrentPage(page);
            // setTotalPages(response.data.totalPages)
        } catch (error) {
            console.log(getErrorMessage(error))
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const columns = useMemo(() => [
        { label: 'Agency Name', key: 'agency_name', sortable: true },
        { label: 'Agent Name', key: 'agent_name', sortable: true },
        { label: 'Agent Mobile No.', key: 'agent_mobile', sortable: true },
        { label: 'Date', key: 'attendance_date', sortable: true },
        { label: 'Agent Type', key: 'agent_type', sortable: true },
        { label: 'Login', key: 'login', sortable: true },
        { label: 'Logout', key: 'logout', sortable: true },
        { label: 'Last Denial Remark Time', key: 'last_denial_remark', sortable: true },
        { label: 'Total MR', key: 'total_MR', sortable: true },
        { label: 'Total Amt', key: 'total_collection', sortable: true },
        { label: 'Total Denied Consumer', key: 'total_denied', sortable: true },
    ], []);

    const getPayload = (data) => {
        let filter = {
            ...(data?.fromDate && data?.toDate) && {
                date_range: {
                    from_date: data.fromDate,
                    to_date: data.toDate
                }
            },
            ...data?.agentType && { agent_type_id: data?.agentType },
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
        console.log("selectedValue", selectedValue.target.value)
        if (!selectedValue.target.value) {
            console.log("selectedValuedd", selectedValue.target.value)
            setValue('workingLevel', null)
            clearErrors('workingLevel')
            setValue('circle', []);
            setValue('division', []);
            setValue('subDivision', []);
            setValue('section', []);
            return
        } else {
            console.log("selectedValuedd", selectedValue.target.value)
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
            const response = await downloadAgentAttendance(payload, type)

            const contentDisposition = response.headers["content-disposition"];
            let filename = "AgentAttendanceReport";

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
            setExportType('')
        } catch (error) {
            console.error("Error downloading the report:", error);
        } finally {
            setIsLoading(false);
            setExportType('')
        }
    }

    const handlePageChange = (page) => {
        // setCurrentPage(page)
        let payload = getPayload(formData)
        getReportData(payload, page)
    }

    const formatData = dataList.map((item) => ({
        ...item,
        entry_date: item?.entry_date ? formatDate(item?.entry_date) : null,
        attendance_date: item?.attendance_date ? formatDate(item?.attendance_date) : null,
    }))


    return (
        <AuthUserReusableCode pageTitle="Agent Attendance Report" isLoading={isLoading}>
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
                    <CustomizedSelectInputWithLabel label='Agent Type' list={agentTypePicklist}
                        {...register('agentType', { valueAsNumber: true })} errors={errors?.agentType} />
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

                    <div className={`mt-7`}>
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
                    {
                        (overflowDataMessage && showTable) &&
                        <div className='col-span-6 text-center'>
                            <span className='m-auto bg-[#FD9292] border border-[#FF0000] text-black text-sm rounded-lg px-4 py-2'>Note: {overflowDataMessage}</span>
                        </div>
                    }
                </div>

            </form>

            <div className="overflow-x-auto mb-4 mt-4">
                {showTable && <ReactTable
                    data={formatData}
                    columns={columns}
                    hideSearchAndOtherButtons
                // handleExportFile={handleExportFile}
                />}
            </div>
        </AuthUserReusableCode>
    );
};

export default AgentAttendanceReport;
