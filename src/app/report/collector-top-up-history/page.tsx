'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';

const CollectorTopUpHistory = () => {
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
                { collectorMobile: 941111111, collectorName: 'Abcd', txnType: 'Recharge', txnAmount: 100, balanceAfterTxn: 1000, date: '2023-01-01' },
                { collectorMobile: 941111111, collectorName: 'Abcd', txnType: 'Payment', txnAmount: 50, balanceAfterTxn: 950, date: '2023-01-02' },
                { collectorMobile: 941111111, collectorName: 'Abcd', txnType: 'Recharge', txnAmount: 200, balanceAfterTxn: 1200, date: '2023-01-03' },
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
            { label: 'TXN Type', key: 'txnType', sortable: true },
            { label: 'Txn Amount', key: 'txnAmount', sortable: true },
            { label: 'Balance After Txn', key: 'balanceAfterTxn', sortable: true },
        ],
        []
    );

    const handleSearch = () => {
        const filtered = topUpData.filter(item => {
            const itemDate = new Date(item.date);
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);

            const isDateInRange =
                (!dateFrom || itemDate >= fromDate) && (!dateTo || itemDate <= toDate);

            return isDateInRange;
        });
        setFilteredData(filtered);
    };

    return (
        <AuthUserReusableCode pageTitle="Colector Top Up History" isLoading={isLoading}>
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

export default CollectorTopUpHistory;
