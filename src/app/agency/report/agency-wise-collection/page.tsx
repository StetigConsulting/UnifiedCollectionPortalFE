'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';

const AgencyWiseCollection = () => {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [division, setDivision] = useState('');
    const [collectorType, setCollectorType] = useState('');
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
                    agencyName: 'MBC Pace Computer BED-1',
                    agencyId: '21100100229012',
                    consumerNo: '10220766184662150818',
                    txnId: '10220766184662150818',
                    txnTime: '06-12-2024 16:43',
                    division: 'AED ASKA-I',
                    subDivision: 'ASKA-I',
                    amount: '₹ 786',
                    currentAmount: '₹ 786',
                    arrearAmount: '₹ 786',
                    collectorType: 'ART',
                    collectionModes: 'NRML',
                    updateDate: '06-12-2024',
                },
                {
                    agencyName: 'MBC Pace Computer BED-2',
                    agencyId: '21100100229013',
                    consumerNo: '10220766184662150819',
                    txnId: '10220766184662150819',
                    txnTime: '06-12-2024 16:45',
                    division: 'AED ASKA-I',
                    subDivision: 'ASKA-I',
                    amount: '₹ 900',
                    currentAmount: '₹ 900',
                    arrearAmount: '₹ 900',
                    collectorType: 'ART',
                    collectionModes: 'NRML',
                    updateDate: '06-12-2024',
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
        { label: 'Agency Name', key: 'agencyName', sortable: true },
        { label: 'Agency ID', key: 'agencyId', sortable: true },
        { label: 'Consumer No.', key: 'consumerNo', sortable: true },
        { label: 'TXN ID', key: 'txnId', sortable: true },
        { label: 'Txn Time', key: 'txnTime', sortable: true },
        { label: 'Division', key: 'division', sortable: true },
        { label: 'Sub Division', key: 'subDivision', sortable: true },
        { label: 'Amount', key: 'amount', sortable: true },
        { label: 'Current Amount', key: 'currentAmount', sortable: true },
        { label: 'Arrear Amount', key: 'arrearAmount', sortable: true },
        { label: 'Collector Type', key: 'collectorType', sortable: true },
        { label: 'Collection Modes', key: 'collectionModes', sortable: true },
        { label: 'Update Date', key: 'updateDate', sortable: true },
    ], []);

    const handleSearch = () => {
        const filtered = data.filter(item => {
            const itemDate = new Date(item.txnTime);
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            const isDateInRange =
                (!dateFrom || itemDate >= fromDate) && (!dateTo || itemDate <= toDate);

            return isDateInRange &&
                (division ? item.division.includes(division) : true) &&
                (collectorType ? item.collectorType.includes(collectorType) : true);
        });
        setFilteredData(filtered);
    };

    return (
        <AuthUserReusableCode pageTitle="Agency Wise Collection" isLoading={isLoading}>
            <div className="grid grid-cols-4 gap-4 w-full">
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
                    label="Division"
                    value={division}
                    list={[]}
                    onChange={(e) => setDivision(e.target.value)}
                />
                <CustomizedSelectInputWithLabel
                    label="Collector Type"
                    list={[]}
                    value={collectorType}
                    onChange={(e) => setCollectorType(e.target.value)}
                />
                <div className="text-end col-span-4">
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 text-white py-2 px-4 rounded-md self-end"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto mb-4">
                <ReactTable
                    data={filteredData}
                    columns={columns}
                />
            </div>

            <div className="flex justify-between">
            </div>
        </AuthUserReusableCode>
    );
};

export default AgencyWiseCollection;
