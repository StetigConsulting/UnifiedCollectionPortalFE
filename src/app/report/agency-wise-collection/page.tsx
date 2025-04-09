'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';

const AgencyWiseCollection = () => {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [transactionDate, setTransactionDate] = useState('');
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showTable, setShowTable] = useState(false);

    useEffect(() => {
        // fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setShowTable(true);
        try {
            const response = [
                {
                    mobileNumber: '9876543210',
                    date: '06-12-2024',
                    noOfTxn: 5,
                    amount: '₹ 5000',
                },
                {
                    mobileNumber: '9876543211',
                    date: '06-12-2024',
                    noOfTxn: 3,
                    amount: '₹ 3000',
                },
            ];
            setData(response);
            setFilteredData(response);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data.');
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'Mobile Number', key: 'mobileNumber', sortable: true },
        { label: 'Date', key: 'date', sortable: true },
        { label: 'No Of TXN', key: 'noOfTxn', sortable: true },
        { label: 'Amount', key: 'amount', sortable: true },
    ], []);

    const handleSearch = () => {
        const filtered = data.filter(item => {
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
        <AuthUserReusableCode pageTitle="Agency Wise Collection" isLoading={isLoading}>
            <div className="flex items-center gap-4">
                <div className="grid grid-cols-3 gap-4 flex-grow">
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
                    <CustomizedInputWithLabel
                        label="Transaction Date"
                        type="date"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md self-end"
                >
                    Search
                </button>
            </div>

            <div className="overflow-x-auto mb-4">
                {showTable &&
                    <ReactTable
                        data={filteredData}
                        columns={columns}
                    />
                }
            </div>

            <div className="flex justify-between">
            </div>
        </AuthUserReusableCode>
    );
};

export default AgencyWiseCollection;
