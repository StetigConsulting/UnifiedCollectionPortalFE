'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { getDailyNonEnergyCollectionReport } from '@/app/api-calls/report/api';

const DailyAgentCollection = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [pageSize, setPageSize] = useState(tableDataPerPage);
    const [dataList, setDataList] = useState([]);

    useEffect(() => {
        getReportData();
    }, []);

    const getReportData = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: currentPage,
            page_size: pageSize,
            filter: {
                transaction_date_range: {
                    from_date: fromDate,
                    to_date: toDate,
                },
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
        {
            label: 'Agency Name', key: 'agency_name', sortable: true
        },
        { label: 'Agent Name', key: 'agent_name', sortable: true },
        { label: 'Agent Mobile No', key: 'agentMobileNo', sortable: true },
        { label: 'MPOS Serial no', key: 'MposSerialNo', sortable: true },
        { label: 'Module Name', key: 'module_name', sortable: true },
    ], []);

    return (
        <AuthUserReusableCode pageTitle="Daily Agent Collection" isLoading={isLoading}>
            <div className="flex items-center gap-4">
                <div className="grid grid-cols-6 gap-4 flex-grow">
                    <CustomizedInputWithLabel
                        label="From Date"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                    <CustomizedInputWithLabel
                        label="To Date"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                    <CustomizedInputWithLabel label='Date type' />
                    <CustomizedInputWithLabel label='Agent role' />
                    <CustomizedInputWithLabel label='Working level' />
                    <CustomizedInputWithLabel label='Circle' />
                </div>
                <Button
                // onClick={handleSearch}
                >
                    Search
                </Button>
            </div>

            <div className="overflow-x-auto mb-4">
                <ReactTable
                    data={dataList}
                    columns={columns}
                />
            </div>
        </AuthUserReusableCode>
    );
};

export default DailyAgentCollection;
