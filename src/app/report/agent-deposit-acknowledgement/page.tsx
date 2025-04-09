'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { tableDataPerPage } from '@/lib/utils';
import { getDepositAcknowledgementReport } from '@/app/api-calls/report/api';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';

const AgentDepositAcknowledgementReport = () => {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [acknowledgementType, setAcknowledgementType] = useState('');
    const [pageSize, setPageSize] = useState(tableDataPerPage)
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [showTable, setShowTable] = useState(false)

    useEffect(() => {
        // fetchReport();
    }, []);

    const fetchReport = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: page,
            page_size: pageSize,
            filter: {}
        }

        payload = {
            ...payload,
            page: page,
            filter: {
                ...payload.filter,
                ...applyFilter
            }
        }
        setIsLoading(true);
        try {
            const response = await getDepositAcknowledgementReport(payload)
            setShowTable(true)
            setData(response?.data?.data);
            setCurrentPage(page);
            setTotalPages(response.data.totalPages)
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data.');
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'Agency ID', key: 'agency_id', sortable: true },
        { label: 'Agency Name', key: 'agency_name', sortable: true },
        { label: 'Agent ID', key: 'agent_id', sortable: true },
        { label: 'Agent Name', key: 'agent_name', sortable: true },
        { label: 'Supervisor ID', key: 'supervisor_id', sortable: true },
        { label: 'Supervisor Name', key: 'supervisor_name', sortable: true },
        { label: 'Deposit Date', key: 'deposit_date', sortable: true },
        { label: 'Deposit Amount', key: 'deposit_amount', sortable: true },
        { label: 'Acknowledgement', key: 'acknowledgement', sortable: true },
    ], []);

    const handleSearch = () => {
        let payload = {
            ...acknowledgementType && { acknowledgement: acknowledgementType },
            ...(dateFrom && dateTo) && {
                deposit_date_range: {
                    "from_date": dateFrom,
                    "to_date": dateTo
                }
            },
        }
        fetchReport(payload, 1)
    }

    return (
        <AuthUserReusableCode pageTitle="Agent Deposit Acknowledgement Report" isLoading={isLoading}>
            <div className="flex items-center gap-4">
                <div className="grid grid-cols-4 gap-4 flex-grow">
                    <CustomizedInputWithLabel
                        label="From Date"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                    <CustomizedInputWithLabel
                        label="To Date"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Status"
                        list={[{ label: 'Pending', value: 'Pending' },
                        { label: 'Yes', value: 'Yes' },
                        { label: 'No', value: 'No' }]}
                        value={acknowledgementType}
                        onChange={(e) => setAcknowledgementType(e.target.value)}
                    />
                    <CustomizedInputWithLabel
                        label="Page Size"
                        type="number"
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value)}
                    />
                </div>
                <Button
                    onClick={handleSearch}
                    className='mt-6'
                >
                    Search
                </Button>
            </div>

            <div className="overflow-x-auto mb-4 mt-4">
                {showTable && <ReactTable
                    data={data}
                    columns={columns}
                    hideSearchAndOtherButtons
                />}
            </div>

            <div className="flex justify-between">
            </div>
        </AuthUserReusableCode>
    );
};

export default AgentDepositAcknowledgementReport;
