'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';

const DailyAgentCollection = () => {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [transactionDate, setTransactionDate] = useState('');
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = [
                {
                    consumerNo: '10220766184662150818',
                    agentMobileNumber: '9876543210',
                    txnId: 'TXN123456',
                    txnDate: '06-12-2024',
                    payMode: 'Online',
                    division: 'AED ASKA-I',
                    subDivision: 'ASKA-I',
                    amount: '₹ 786',
                    currentAmount: '₹ 786',
                    arrearAmount: '₹ 200',
                    uploadDate: '06-12-2024',
                },
                {
                    consumerNo: '10220766184662150819',
                    agentMobileNumber: '9876543211',
                    txnId: 'TXN123457',
                    txnDate: '06-12-2024',
                    payMode: 'Cash',
                    division: 'AED ASKA-II',
                    subDivision: 'ASKA-II',
                    amount: '₹ 900',
                    currentAmount: '₹ 900',
                    arrearAmount: '₹ 150',
                    uploadDate: '06-12-2024',
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
        { label: 'Consumer No', key: 'consumerNo', sortable: true },
        { label: 'Agent Mobile Number', key: 'agentMobileNumber', sortable: true },
        { label: 'TXN ID', key: 'txnId', sortable: true },
        { label: 'TXN Date', key: 'txnDate', sortable: true },
        { label: 'Pay Mode', key: 'payMode', sortable: true },
        { label: 'Division', key: 'division', sortable: true },
        { label: 'Sub Division', key: 'subDivision', sortable: true },
        { label: 'Amount', key: 'amount', sortable: true },
        { label: 'Current Amount', key: 'currentAmount', sortable: true },
        { label: 'Arrear Amount', key: 'arrearAmount', sortable: true },
        { label: 'Upload Date', key: 'uploadDate', sortable: true },
    ], []);


    const handleSearch = () => {
        const filtered = data.filter(item => {
            const itemDate = new Date(item.txnTime);
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            const isDateInRange =
                (!dateFrom || itemDate >= fromDate) && (!dateTo || itemDate <= toDate);

            return isDateInRange
        });
        setFilteredData(filtered);
    };

    return (
        <AuthUserReusableCode pageTitle="Daily Collection" isLoading={isLoading}>
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
                <ReactTable
                    data={filteredData}
                    columns={columns}
                />
            </div>
        </AuthUserReusableCode>
    );
};

export default DailyAgentCollection;
