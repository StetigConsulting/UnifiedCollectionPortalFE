'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';

const TransactionRecord = () => {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [topUpData, setTopUpData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchTopUpHistory();
    }, []);

    const fetchTopUpHistory = async () => {
        setIsLoading(true);
        try {
            const response = [
                {
                    collectorMobile: '1234567890',
                    collectorName: 'John Doe',
                    consumerNo: 'C123456',
                    consumerName: 'Jane Smith',
                    collectorOperatingBalance: 1500.75,
                    collectorClosingBalance: 1200.50,
                    agencyOpeningBalance: 3000.00,
                    agencyClosingBalance: 2800.00,
                    entryDate: '2023-10-01',
                },
                {
                    collectorMobile: '9876543210',
                    collectorName: 'Alice Johnson',
                    consumerNo: 'C654321',
                    consumerName: 'Bob Brown',
                    collectorOperatingBalance: 2000.00,
                    collectorClosingBalance: 1800.00,
                    agencyOpeningBalance: 4000.00,
                    agencyClosingBalance: 3900.00,
                    entryDate: '2023-10-02',
                },
                {
                    collectorMobile: '5551234567',
                    collectorName: 'Michael Green',
                    consumerNo: 'C789012',
                    consumerName: 'Emily White',
                    collectorOperatingBalance: 2500.50,
                    collectorClosingBalance: 2300.25,
                    agencyOpeningBalance: 5000.00,
                    agencyClosingBalance: 4800.00,
                    entryDate: '2023-10-03',
                }
            ];
            setTopUpData(response);
            setFilteredData(response);
        } catch (error) {
            console.error('Error fetching top-up history:', error);
            toast.error('Failed to load top-up history.');
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(
        () => [
            { label: 'Collector Mobile', key: 'collectorMobile', sortable: true },
            { label: 'Collector Name', key: 'collectorName', sortable: true },
            { label: 'Consumer No', key: 'consumerNo', sortable: true },
            { label: 'Consumer Name', key: 'consumerName', sortable: true },
            { label: 'Collector Operating Balance', key: 'collectorOperatingBalance', sortable: true },
            { label: 'Collector Closing Balance', key: 'collectorClosingBalance', sortable: true },
            { label: 'Agency Opening Balance', key: 'agencyOpeningBalance', sortable: true },
            { label: 'Agency Closing Balance', key: 'agencyClosingBalance', sortable: true },
            { label: 'Entry Date', key: 'entryDate', sortable: true },
        ],
        []
    );

    const handleSearch = () => {
        const filtered = topUpData.filter(item => {
            const itemDate = new Date(item.entryDate);
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);

            const isDateInRange =
                (!dateFrom || itemDate >= fromDate) && (!dateTo || itemDate <= toDate);

            return isDateInRange;
        });
        setFilteredData(filtered);
    };

    return (
        <AuthUserReusableCode pageTitle="Transaction record" isLoading={isLoading}>
            <div className="flex items-center gap-4">
                <div className="grid grid-cols-2 gap-4 flex-grow">
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
                </div>
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md self-end"
                >
                    Search
                </button>
            </div>

            <div className="overflow-x-auto">
                <ReactTable
                    data={filteredData}
                    columns={columns}
                />
            </div>
        </AuthUserReusableCode>
    );
};

export default TransactionRecord;
