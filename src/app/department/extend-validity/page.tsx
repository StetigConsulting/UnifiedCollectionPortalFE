'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extendValidityFilterSchema, extendValiditySchema } from '@/lib/zod';
import { z } from 'zod';
import { extendValidity, getAgenciesWithDiscom, getAgencyById } from '@/app/api-calls/department/api';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { formatDate, exportPicklist, tableDataPerPage, getErrorMessage } from '@/lib/utils';
import ReactTable from '@/components/ReactTable';
import { getAgencyExtendValidityLogs, downloadAgencyExtendValidityLogs } from '@/app/api-calls/report/api';
import moment from 'moment';

type FormData = z.infer<typeof extendValiditySchema>;

const ExtendValidity = () => {
    const { data: session } = useSession()
    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(extendValiditySchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (data: FormData) => {

        let payload = {
            agency_id: data.agencyId,
            validity_from_date: data.newFromValidity,
            validity_to_date: data.newToValidity,
            extension_document_no: data.amendmentDocumentNumber,
            extension_date: data.amendmentDocumentDate
        }

        try {
            setIsSubmitting(true);
            const response = await extendValidity(payload);
            toast.success("Validity extended successfully");
            getAgencyList()
            reset({
                agencyName: null,
                agencyId: null,
                currentFromValidity: '',
                currentToValidity: '',
                newFromValidity: '',
                newToValidity: '',
                amendmentDocumentNumber: '',
                amendmentDocumentDate: '',
            });
            if (agencyIdFromUrl) {
                const url = new URL(window.location.href);
                url.search = '';
                window.history.pushState({}, '', url.href);
            }
        } catch (error) {
            let errorMessage = getErrorMessage(error);
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false);
        }
    };

    const [agencyList, setAgencyList] = useState([])

    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams();
    const agencyIdFromUrl = searchParams.get('id');

    useEffect(() => {
        if (agencyIdFromUrl) {
            fetchAgencyById(agencyIdFromUrl);
        } else {
            getAgencyList();
        }
    }, [agencyIdFromUrl]);

    const fetchAgencyById = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await getAgencyById(id);
            const agency = response.data;
            setValue('agencyId', agency.id || '');
            setValue('agencyName', agency.id || '');
            setValue('currentFromValidity', agency.validity_start_date || '');
            setValue('currentToValidity', agency.validity_end_date || '');
            setValue('newFromValidity', '');
            setValue('newToValidity', '');
            setAgencyList([{
                ...response.data,
                label: response.data.agency_name,
                value: response.data.id,
            }]);
            setValue('agencyName', response.data.id)
        } catch (error) {
            console.error("Failed to fetch agency by ID:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId);
            setAgencyList(
                response?.data?.map((item) => ({
                    ...item,
                    label: item.agency_name,
                    value: item.id,
                }))
            );

        } catch (error) {
        } finally {
            setIsLoading(false);
        }

    }

    const selectedAgency = watch('agencyName');

    useEffect(() => {
        if (selectedAgency) {
            const agency = agencyList.find((item) => item.id === Number(selectedAgency));
            if (agency) {
                setValue('agencyId', agency.id || '');
                setValue('agencyName', agency.id || '');
                setValue('currentFromValidity', agency.validity_start_date || '');
                setValue('currentToValidity', agency.validity_end_date || '');
                setValue('newFromValidity', agency.validity_start_date || '');
                setValue('newToValidity', '');
            }
        }
    }, [selectedAgency, agencyList]);

    const formData = watch();

    // Filter and Table State
    const [tableData, setTableData] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(tableDataPerPage);

    // Filter form
    const { register: filterRegister, handleSubmit: handleFilterSubmit, setValue: setFilterValue, watch: filterWatch, formState: { errors: filterErrors, isValid: filterIsValid } } = useForm({
        resolver: zodResolver(extendValidityFilterSchema),
        mode: 'onChange',
        defaultValues: {
            fromDate: '',
            toDate: '',
            dateType: 'created_on',
            amendmentDocumentNo: '',
            pageSize: tableDataPerPage,
            agencyId: '',
        }
    });

    const fetchTableData = async (filters = {}, page = 1) => {
        setTableLoading(true);
        try {
            const filterValues = { ...filterWatch(), ...filters };
            const payload = {
                page,
                page_size: Number(filterValues.pageSize),
                filter: {
                    ...(filterValues.dateType === 'created_on' ? {
                        creation_date_range: {
                            from_date: filterValues.fromDate,
                            to_date: filterValues.toDate
                        }
                    } : {
                        extension_date_range: {
                            from_date: filterValues.fromDate,
                            to_date: filterValues.toDate
                        }
                    }),
                    ...(filterValues.agencyId && { agency_id: Number(filterValues.agencyId) }),
                    ...(filterValues.amendmentDocumentNo && { extension_document_no: filterValues.amendmentDocumentNo })
                }
            };
            const res = await getAgencyExtendValidityLogs(payload);
            setTableData(res?.data?.data || []);
            setCurrentPage(page);
            setTotalPages(res?.data?.totalPages || 1);
            setPageSize(res?.data?.pageSize);
        } catch (err) {
            setTableData([]);
            setTotalPages(1);
        } finally {
            setTableLoading(false);
        }
    };

    const columns = [
        { label: 'Agency Name', key: 'agency_name' },
        { label: 'Validity From', key: 'validity_from_date' },
        { label: 'Validity To', key: 'validity_to_date' },
        { label: 'Amendment Document Number', key: 'extension_document_no' },
        { label: 'Amendment Document Date', key: 'extension_date' },
        { label: 'Created On', key: 'created_on' },
        { label: 'Created By', key: 'created_by_user' },
    ];

    const formatData = tableData.map((item) => ({
        ...item,
        validity_from_date: formatDate(item.validity_from_date),
        validity_to_date: formatDate(item.validity_to_date),
        extension_date: formatDate(item.extension_date),
        created_on: moment(item.created_on).format('DD/MM/YYYY, HH:mm:ss'),
    }));

    const handlePageChange = (page) => {
        fetchTableData({}, page);
    };

    const onFilterSubmit = (data) => {
        fetchTableData(data, 1);
    };

    const [exportType, setExportType] = useState('');
    const [exportLoading, setExportLoading] = useState(false);

    const handleExportFile = async (type) => {
        setExportType(type);
        setExportLoading(true);
        try {
            const filterValues = filterWatch();
            const payload = {
                ...(filterValues.dateType === 'created_on' ? {
                    creation_date_range: {
                        from_date: filterValues.fromDate,
                        to_date: filterValues.toDate
                    }
                } : {
                    extension_date_range: {
                        from_date: filterValues.fromDate,
                        to_date: filterValues.toDate
                    }
                }),
                ...(filterValues.agencyId && { agency_id: Number(filterValues.agencyId) }),
                ...(filterValues.amendmentDocumentNo && { extension_document_no: filterValues.amendmentDocumentNo })
            }
            const response = await downloadAgencyExtendValidityLogs(payload, type);
            const contentDisposition = response.headers["content-disposition"];
            let filename = "ExtendValidityLogs";

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
        } catch (err) {
            toast.error('Export failed');
        } finally {
            setExportLoading(false);
            setExportType('');
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Extend Validity" isLoading={isLoading || tableLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* <CustomizedSelectInputWithLabel
                        label="Circle"
                        errors={errors.circle}
                        containerClass=""
                        placeholder="Select Circle Type"
                        list={[]}
                        {...register('circle')}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Division"
                        errors={errors.division}
                        containerClass=""
                        placeholder="Select Division"
                        list={[]}
                        {...register('division')}
                    /> */}
                    <CustomizedSelectInputWithLabel
                        label="Agency Name"
                        errors={errors.agencyName}
                        containerClass="col-span-2"
                        placeholder="Select Agency Name"
                        list={agencyList}
                        required
                        {...register('agencyName')}
                    />
                    <CustomizedInputWithLabel
                        label="Agency ID"
                        errors={errors.agencyId}
                        containerClass="col-span-2"
                        placeholder="Agency ID"
                        {...register('agencyId')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Current Validity From"
                        errors={errors.currentFromValidity}
                        containerClass=""
                        placeholder="Current Validity From"
                        {...register('currentFromValidity')}
                        value={formData?.currentFromValidity ? formatDate(watch('currentFromValidity')) : ''}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Current Validity To"
                        errors={errors.currentToValidity}
                        containerClass=""
                        placeholder="Current Validity To"
                        {...register('currentToValidity')}
                        value={formData?.currentFromValidity ? formatDate(watch('currentToValidity')) : ''}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Validity From Date"
                        errors={errors.newFromValidity}
                        containerClass=""
                        placeholder="Choose Validity From Date"
                        type="date"
                        required
                        {...register('newFromValidity')}
                    />
                    <CustomizedInputWithLabel
                        label="Validity To Date"
                        errors={errors.newToValidity}
                        containerClass=""
                        placeholder="Choose Validity Date"
                        type="date"
                        required
                        {...register('newToValidity')}
                    />
                    <CustomizedInputWithLabel
                        label="Amendment Document Number"
                        errors={errors.amendmentDocumentNumber}
                        containerClass=""
                        placeholder="Enter Amendment Document Number"
                        required
                        {...register('amendmentDocumentNumber')}
                    />
                    <CustomizedInputWithLabel
                        label="Amendment Document Date"
                        errors={errors.amendmentDocumentDate}
                        containerClass=""
                        type="date"
                        required
                        {...register('amendmentDocumentDate')}
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                        </> : "Submit"}
                    </Button>
                </div>
            </form>
            {/* Filter and Table Section */}
            <div className="mt-8">
                <form className="grid grid-cols-5 gap-4" onSubmit={handleFilterSubmit(onFilterSubmit)}>
                    <CustomizedInputWithLabel
                        label="From Date"
                        type="date"
                        {...filterRegister('fromDate')}
                        errors={filterErrors.fromDate}
                    />
                    <CustomizedInputWithLabel
                        label="To Date"
                        type="date"
                        {...filterRegister('toDate')}
                        errors={filterErrors.toDate}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Date Type"
                        list={[
                            { label: 'Created On', value: 'created_on' },
                            { label: 'Amendment Document Date', value: 'extension_date' },
                        ]}
                        {...filterRegister('dateType')}
                        errors={filterErrors.dateType}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Agency"
                        list={agencyList}
                        {...filterRegister('agencyId')}
                        errors={filterErrors.agencyId}
                    />
                    <CustomizedInputWithLabel
                        label="Amendment Document No."
                        {...filterRegister('amendmentDocumentNo')}
                        errors={filterErrors.amendmentDocumentNo}
                    />
                    <CustomizedInputWithLabel
                        label="Page Size"
                        type="number"
                        {...filterRegister('pageSize', { valueAsNumber: true })}
                        errors={filterErrors.pageSize}
                    />
                    <div className='mt-6'>
                        <Button variant='default' type='submit'>Search</Button>
                    </div>
                    <CustomizedSelectInputWithLabel
                        label="Export"
                        placeholder="Export to"
                        list={exportPicklist}
                        value={exportType}
                        onChange={(e) => handleExportFile(e.target.value)}
                        containerClass=""
                        disabled={!filterIsValid || exportLoading}
                        errors={undefined}
                    />
                </form>
                <div className='mt-4'>
                    <ReactTable
                        data={formatData}
                        columns={columns}
                        avoidSrNo={false}
                        itemsPerPage={pageSize}
                        dynamicPagination
                        pageNumber={currentPage}
                        totalPageNumber={totalPages}
                        onPageChange={handlePageChange}
                        hideSearchAndOtherButtons
                    />
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default ExtendValidity;
