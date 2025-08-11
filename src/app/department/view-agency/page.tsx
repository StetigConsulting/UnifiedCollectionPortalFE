'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { activateAgencyAccount, deactivateAgencyAccountAPI, getAgenciesWithDiscom, getAgenciesWithDiscomWithBalance, getLevels } from '@/app/api-calls/department/api';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { BatteryCharging, CalendarArrowUp, CreditCard, History, Pencil, Power, PowerOff, RotateCcw, UserCheck, UserX } from 'lucide-react';
import ReactTable from '@/components/ReactTable';
import AlertPopup from '@/components/Agency/ViewAgency/AlertPopup';
import { useRouter } from 'next/navigation';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { exportPicklist, formatDate, getDataToDisplayInTable, getErrorMessage, tableDataPerPage, urlsListWithTitle } from '@/lib/utils';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import * as XLSX from 'xlsx';

const ViewAgency = () => {
    const { data: session } = useSession()
    const [search, setSearch] = useState('');
    const [agencyList, setAgencyList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [workingLevelFilter, setWorkingLevelFilter] = useState('all');
    const [workingLevelList, setWorkingLevelList] = useState([])
    const [selectedRow, setSelectedRow] = useState<any | null>(null);

    useEffect(() => {
        getAgencyList();
    }, []);

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscomWithBalance(session?.user?.discomId);
            const discomList = await getLevels(session?.user?.discomId);
            const listOfLevel = discomList.data.reduce((acc, item) => {
                acc[item.id] = item.levelName;
                return acc;
            }, {});
            const levelOptions = discomList.data
                .filter((item) => item.levelType === "MAIN")
                .map((item) => ({
                    label: item.levelName,
                    value: item.levelName,
                }));
            let data = [{ label: 'All', value: 'all' }, ...levelOptions];
            setWorkingLevelList(data)
            setAgencyList(
                response?.data
                    ?.sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime())
                    ?.map((item) => {
                        let data = [];
                        if (item.collection_type_energy) {
                            data.push('Energy')
                        }
                        if (item.collection_type_non_energy) {
                            data.push('Non-Energy')
                        }

                        item.non_energy_types.map((mode) => data.push(mode.type_name))

                        return ({
                            ...item,
                            id: item.id,
                            agencyName: item.agency_name,
                            agencyAddress: item.agency_address,
                            contactPerson: item.contact_person,
                            phone: item.phone,
                            maxLimit: item.maximum_limit,
                            woNumber: item.wo_number,
                            validity: item.validity_end_date,
                            workingOffice: listOfLevel[item.working_level] || 'N/A',
                            workingLevelOffice: item.working_level_offices.map((mode) => mode.office_description).join(', ') || 'N/A',
                            permissions: item.collection_payment_modes.map((mode) => mode.mode_name).join(", ") || 'N/A',
                            collectionModes: data.join(', ') || 'N/A',
                            isActive: item.is_active,
                        })
                    })
            );
            setCurrentPage(1);
            setTotalPages(Math.ceil(response.data.length / tableDataPerPage))
        } catch (error) {
            console.error('Failed to get agency:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const activateAgencyUser = async (id: number) => {
        setIsLoading(true);
        try {
            await activateAgencyAccount(id);
            toast.success('Agency activated successfully');
            getAgencyList();
            setSelectedRow(null)
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const deactivateAgencyUser = async (id: number) => {
        setIsLoading(true);
        try {
            await deactivateAgencyAccountAPI(id);
            toast.success('Agency deactivated successfully');
            getAgencyList();
            setSelectedRow(null)
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(
        () => [
            // { label: 'Action', key: 'action', sortable: false, ignored: true },
            { label: 'Agency ID', key: 'id', sortable: true, ignored:false},
            { label: 'Agency Name', key: 'agencyName', sortable: true },
            { label: 'Current Balance', key: 'current_balance', sortable: true, align: 'center' },
            { label: 'Balance allocated to agents', key: 'agents_allocated_balance', sortable: true, align: 'center' },
            { label: 'Balance available for recharge', key: 'balance_available_for_recharge', sortable: true, align: 'center' },
            { label: 'Address', key: 'agencyAddress', sortable: true },
            { label: 'Contact Person', key: 'contactPerson', sortable: true },
            { label: 'Phone', key: 'phone', sortable: true },
            { label: 'Max Limit', key: 'maxLimit', sortable: true },
            { label: 'WO Number', key: 'woNumber', sortable: true },
            { label: 'Validity From', key: 'validity_start_date', sortable: true },
            { label: 'Validity To', key: 'validity_end_date', sortable: true },
            { label: 'Working Office', key: 'workingOffice', sortable: true },
            { label: 'Working Level Office', key: 'workingLevelOffice', sortable: true },
            { label: 'Permissions', key: 'permissions', sortable: true },
            { label: 'Collection Modes', key: 'collectionModes', sortable: true },
        ],
        []
    );

    const router = useRouter();

    const handleEditAgency = (id: number) => {
        router.push(`/department/edit-agency?id=${id}`);
        setIsLoading(true)
    }

    const handleExtendValidity = (id: number) => {
        router.push(`/department/extend-validity?id=${id}`);
        setIsLoading(true)
    }

    const handleReverse = (id: number) => {
        router.push(`${urlsListWithTitle.agencyRecharge.url}?id=${id}&type=${'reverse'}`)
        setIsLoading(true)
    }

    const handleRecharge = (id: number) => {
        router.push(`${urlsListWithTitle.agencyRecharge.url}?id=${id}`)
        setIsLoading(true)
    }

    const handleViewHistory = (id: number) => {
        router.push(`${urlsListWithTitle.agencyBalanceHistory.url}?id=${selectedRow.id}&name=${selectedRow?.agencyName}`)
        setIsLoading(true)
    }

    const [validityFrom, setValidityFrom] = useState('');
    const [validityTo, setValidityTo] = useState('');

    const filteredAgencies = agencyList.filter((item) => {
        const isStatusMatch =
            statusFilter === 'all' || (statusFilter === 'active' ? item.isActive : !item.isActive);
        const isWorkingLevelMatch =
            workingLevelFilter === 'all' || item.workingOffice === workingLevelFilter;

        const itemValidityFrom = new Date(item.validity_start_date);
        const itemValidityTo = new Date(item.validity_end_date);

        const isDateRangeMatch =
            validityFrom && validityTo
                ? new Date(validityFrom) <= itemValidityFrom && new Date(validityTo) >= itemValidityTo
                : true;

        return isStatusMatch && isWorkingLevelMatch && isDateRangeMatch;
    });

    const tableData = filteredAgencies.map((item, index) => ({
        ...item,
        validity_start_date: formatDate(item.validity_start_date),
        validity_end_date: formatDate(item.validity_end_date),
    }));

    const listOfAgencyStatus = [{
        label: 'All',
        value: 'all',
    }, {
        label: 'Active',
        value: 'active',
    }, {
        label: 'Inactive',
        value: 'inactive',
    }]

    const handleRowSelection = (row: any) => {
        setSelectedRow(row)
    }

    const getSelectedRowButton = () => {
        return <div className="space-x-2">
            {selectedRow?.isActive ? <AlertPopup triggerCode={<Button variant='destructive' className="cursor-pointer">
                <PowerOff />
                Deactivate
            </Button>} handleContinue={() => deactivateAgencyUser(selectedRow.id)}
                title='Confirm Deactivating' description='Are you sure you want to save the deactivate Agency? Please review the details carefully before confirming.' continueButtonText='Confirm'
            /> :
                <AlertPopup triggerCode={<Button variant='success' className="cursor-pointer">
                    <Power />
                    Activate
                </Button>} handleContinue={() => activateAgencyUser(selectedRow.id)}
                    title='Confirm Activating' description='Are you sure you want to save the activate Agency? Please review the details carefully before confirming.' continueButtonText='Confirm'
                />}
            <Button variant='success' onClick={() => handleExtendValidity(selectedRow.id)}><CreditCard className='cursor-pointer h-5 w-5' />Extend Validity</Button>
            <Button variant='default' onClick={() => handleEditAgency(selectedRow.id)} ><Pencil className='cursor-pointer h-5 w-5' />Edit Agency</Button>
            <Button variant='default' onClick={() => handleViewHistory(selectedRow.id)} ><History className='cursor-pointer h-5 w-5' />View History</Button>
            <Button variant='success' onClick={() => handleRecharge(selectedRow.id)} ><BatteryCharging className='cursor-pointer h-5 w-5' />Recharge</Button>
            <Button variant='destructive' onClick={() => handleReverse(selectedRow.id)} ><RotateCcw className='cursor-pointer h-5 w-5' />Reverse</Button>
        </div>
    }

    const visibleColumns = columns.filter(column => !column?.ignored);

    const exportToExcel = () => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB').split('/').reverse().join('');
        const formattedTime = now
            .toLocaleTimeString('en-GB', { hour12: false })
            .replace(/:/g, '_');

        const filename = `${'ViewAgency'}_${formattedDate}_${formattedTime}.xlsx`;

        const exportData = tableData.map(row => {
            const newRow = {};
            visibleColumns.forEach(column => {
                let value = row[column.key];
                if (typeof value === "object" && value !== null) {
                    value = value?.props?.children ?? '';
                }
                newRow[column.label] = value;
            });
            return newRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, filename);
    };

    const convertToCSVString = (value: any): string => {
        if (value === null || value === undefined) {
            return '';
        }

        let valueAsString = String(value);

        if (valueAsString.includes('"')) {
            valueAsString = `"${valueAsString.replace(/"/g, '""')}"`;
        }

        if (valueAsString.includes(',') || valueAsString.includes('\n')) {
            valueAsString = `"${valueAsString}"`;
        }

        return valueAsString;
    };


    const exportToCSV = () => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB').split('/').reverse().join('');
        const formattedTime = now
            .toLocaleTimeString('en-GB', { hour12: false })
            .replace(/:/g, '_');

        const filename = `${'ViewAgency'}_${formattedDate}_${formattedTime}.csv`;

        const csvData = tableData.map((row) =>
            visibleColumns
                .map((col) => convertToCSVString(row[col.key]))
                .join(',')
        );

        const csvString = [columns.map((col) => col.label).join(','), ...csvData].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    const handleExport = (e: any) => {
        const value = e.target.value;
        setExportTo(e.target.value);
        if (value === 'xlsx') {
            exportToExcel();
        } else if (value === 'csv') {
            exportToCSV();
        }
        setExportTo('');
    }

    const [exportTo, setExportTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <AuthUserReusableCode pageTitle="View Agency" isLoading={isLoading}>
            <ReactTable
                additionalData={<div className="grid grid-cols-9 gap-4">
                    <CustomizedInputWithLabel label='Validity From' type="date"
                        containerClass='col-span-2'
                        value={validityFrom}
                        onChange={(e) => setValidityFrom(e.target.value)} />
                    <CustomizedInputWithLabel label='Validity To' type="date"
                        containerClass='col-span-2'
                        value={validityTo}
                        onChange={(e) => setValidityTo(e.target.value)} />
                    <CustomizedSelectInputWithLabel
                        label="Agency status"
                        containerClass='col-span-2'
                        list={listOfAgencyStatus}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        removeDefaultOption
                    />
                    <CustomizedSelectInputWithLabel label="Working Level" value={workingLevelFilter}
                        list={workingLevelList} onChange={(e) => setWorkingLevelFilter(e.target.value)}
                        containerClass='col-span-2' removeDefaultOption />
                    <CustomizedSelectInputWithLabel label='Export to' value={exportTo} list={exportPicklist}
                        onChange={handleExport} placeholder='Select' />
                </div>}
                data={getDataToDisplayInTable(tableData, currentPage, tableDataPerPage)}
                isSelectable={true}
                onRowSelect={handleRowSelection}
                onRowSelectButtons={
                    getSelectedRowButton()
                }
                selectedRow={selectedRow}
                columns={columns}
                hideSearchButton
                hideExports
                dynamicPagination={true}
                pageNumber={currentPage}
                totalPageNumber={totalPages}
                onPageChange={handlePageChange}
            />

        </AuthUserReusableCode >
    );
};

export default ViewAgency;
