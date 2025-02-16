'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';

const CCWalletHistory = () => {
    const [date, setDate] = useState('');
    const [search, setSearch] = useState('');
    const [ccWalletData, setCcWalletData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCCWalletData();
    }, []);

    const fetchCCWalletData = async () => {
        setIsLoading(true);
        try {
            const response = [
                {
                    userId: '10000',
                    mobileNumber: '7738141900',
                    franchiseName: 'AED-1 (SANGRAH CC)',
                    collectorName: 'Laxmikant Bissoyi',
                    currentBalance: '5000000',
                    totalRecharge: '5000000',
                    totalCollection: '5000000',
                    totalReverse: '0',
                },
                {
                    userId: '10001',
                    mobileNumber: '7738141900',
                    franchiseName: 'AED-1 (SANGRAH CC)',
                    collectorName: 'Laxmikant Bissoyi',
                    currentBalance: '5000000',
                    totalRecharge: '5000000',
                    totalCollection: '5000000',
                    totalReverse: '0',
                },
                // Add more rows as necessary
            ];
            setCcWalletData(response);
            setFilteredData(response);
        } catch (error) {
            console.error('Error fetching CC Wallet data:', error);
            toast.error('Failed to load CC Wallet history.');
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'User ID', key: 'userId', sortable: true },
        { label: 'Mobile Number', key: 'mobileNumber', sortable: true },
        { label: 'Franchise Name', key: 'franchiseName', sortable: true },
        { label: 'Collector Name', key: 'collectorName', sortable: true },
        { label: 'Current Balance', key: 'currentBalance', sortable: true },
        { label: 'Total Recharge', key: 'totalRecharge', sortable: true },
        { label: 'Total Collection', key: 'totalCollection', sortable: true },
        { label: 'Total Reverse', key: 'totalReverse', sortable: true },
    ], []);

    const handleSearch = () => {
        const filtered = ccWalletData.filter(item =>
            item.userId.toString().includes(search) ||
            item.mobileNumber.includes(search) ||
            item.franchiseName.toLowerCase().includes(search.toLowerCase()) ||
            item.collectorName.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredData(filtered);
    };

    return (
        <AuthUserReusableCode pageTitle="CC Wallet History" isLoading={isLoading}>
            <div className="flex items-center gap-4">
                <div className="grid grid-cols-2 gap-4 flex-grow">
                    <CustomizedInputWithLabel
                        label="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className="col-span-4 text-end">
                    <Button variant="default" onClick={handleSearch}>
                        Search
                    </Button>
                </div>
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

export default CCWalletHistory;
