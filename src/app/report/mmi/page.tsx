'use client'

import { getAllAgentByAgencyId } from '@/app/api-calls/agency/api';
import { getAgenciesWithDiscom, getAgencyById, getLevels, getLevelsDiscomId } from '@/app/api-calls/department/api';
import { getRosourceByDiscomId } from '@/app/api-calls/other/api';
import AuthUserReusableCode from '@/components/AuthUserReusableCode'
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedMultipleSelectInputWithLabelNumber from '@/components/CustomizedMultipleSelectInputWithLabelNumber';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import { encryptParamsForMMI } from '@/lib/utils';
import { mmiReportSchema, MmiReportSchemaData } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';

const MMI = () => {

    const { data: session } = useSession()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MmiReportSchemaData>({
        resolver: zodResolver(mmiReportSchema),
        defaultValues: {
            fromDate: '',
            toDate: '',
            workingLevel: null,
            circle: [],
            division: [],
            subDivision: [],
            section: [],
            agencyName: '',
            agentMobile: '',
        },
    });

    const formData = watch()
    const [isLoading, setIsLoading] = React.useState(false)
    const [levelNameMappedWithId, setLevelNameMappedWithId] = useState<Record<string, number>>({})
    const [workingLevelList, setWorkingLevelList] = React.useState([])

    const [accessToken, setAccessToken] = useState('')

    const getAccessToken = async () => {
        try {
            const res = await fetch('/api/mmi-token', {
                method: 'POST',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setAccessToken(data?.access_token)
        } catch (err) {
            console.error('Error:', err.message);
        }
    }

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

    const [discomName, setDiscomName] = useState('')

    useEffect(() => {
        getAccessToken()
        getWorkingLevel()
        getAgencyByDiscom()
        getRosourceByDiscomId(session?.user?.discomId).then((res) => {
            const logoValue = res.data.find(item => item.name === "Name")?.value;
            setDiscomName(logoValue);
        })
    }, [])

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

    const onSubmit = (data) => {
        let payload = {
            access_token: accessToken,
            discom: discomName,
            fromDate: moment(data.fromDate).format('DD-MM-YYYY'),
            toDate: moment(data.toDate).format('DD-MM-YYYY'),
            workingLevel: data.workingLevel,
            circle: data.circle?.length > 0 ? data.circle?.[0] : null,
            division: data.division?.length > 0 ? data.division?.[0] : null,
            subDivision: data.subDivision?.length > 0 ? data.subDivision?.[0] : null,
            section: data.section?.length > 0 ? data.section?.[0] : null,
            userId: formData?.agentMobile ? formData?.agentMobile : null,
            app_category: 'TP_COLLECTION',
            fcc_id: 'null',
            manager_id: 'null',
        }


        const queryParams = new URLSearchParams({
            access_token: payload.access_token,
            discom: payload.discom,
            circle: payload.circle,
            division: payload.division,
            subdivision: payload.subDivision,
            section: payload.section,
            userid: payload.userId,
            app_category: payload.app_category,
            fcc_id: payload.fcc_id,
            manager_id: payload.manager_id,
            toDate: payload.toDate,
            fromDate: payload.fromDate,
        }).toString();
        let encryptedParams = encryptParamsForMMI(queryParams);

        const fullUrl = `${process.env.NEXT_PUBLIC_MMI_REPORTURL}/tata-power/#/tpReports/fieldforceactivity?params=${encryptedParams}`;
        setIframeUrl(fullUrl);
        setShowIframe(true);
    };

    const [iframeUrl, setIframeUrl] = useState('')
    const [showIframe, setShowIframe] = useState(false)

    const [agenciesList, setAgenciesList] = useState([])

    const getAgencyByDiscom = async () => {
        await getAgenciesWithDiscom(session?.user?.discomId).then(res => {
            setAgenciesList(res.data.map((item) => {
                return {
                    value: item.id,
                    label: item.agency_name,
                };
            }))
        })
    }

    const [agentList, setAgentList] = useState([]);

    const handleAgencyChange = async (agencyId) => {
        setValue('agencyName', agencyId);
        setValue('agentMobile', '');

        if (!agencyId) {
            setAgentList([]);
            return;
        }
        setIsLoading(true)
        const res = await getAllAgentByAgencyId(agencyId);
        if (res?.data) {
            setAgentList(
                res.data.map((agent) => ({
                    value: agent.primary_phone,
                    label: `${agent.agent_name}`,
                }))
            );
        } else {
            setAgentList([]);
        }
        setIsLoading(false)
    };

    return (
        <AuthUserReusableCode pageTitle='MMI' isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4">
                <div className='grid grid-cols-6 gap-4 flex-grow'>
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
                        label='Agency Name'
                        list={agenciesList}
                        value={watch('agencyName')}
                        required
                        {...register('agencyName')}
                        onChange={(e) => handleAgencyChange(e.target.value)}
                        errors={errors?.agencyName}
                    />

                    <CustomizedSelectInputWithLabel label='Agent Name' list={agentList}
                        {...register('agentMobile')} required disabled={!formData.agencyName}
                        errors={errors?.agentMobile} />
                    <CustomizedSelectInputWithLabel label='Working level' list={workingLevelList}
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

                    <div className={'mt-6'}>
                        <Button variant='default' type='submit'>Search</Button>
                    </div>
                </div>
            </form>
            {showIframe &&
                <iframe
                    src={iframeUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                ></iframe>
            }
        </AuthUserReusableCode>
    )
}

export default MMI