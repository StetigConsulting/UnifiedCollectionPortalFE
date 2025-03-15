'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';

const WalletHistory = () => {
    const [date, setDate] = useState('');
    const [search, setSearch] = useState('');
    const [walletData, setWalletData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        setIsLoading(true);
        try {
            const response = [
                {
                    agencyName: 'M/S Buddham Builders KLD',
                    agencyId: '1000000000',
                    txnType: 'Recharge',
                    topUpReverse: '5000000',
                    currentBalance: '5000000',
                    previousBalance: '5000000',
                    txnDate: '10-09-2022',
                },
                {
                    agencyName: 'M/S Buddham Builders KLD',
                    agencyId: '7738141900',
                    txnType: 'Recharge',
                    topUpReverse: '5000000',
                    currentBalance: '5000000',
                    previousBalance: '5000000',
                    txnDate: '10-09-2022',
                },
            ];
            setWalletData(response);
            setFilteredData(response);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            toast.error('Failed to load wallet history.');
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'Agency Name', key: 'agencyName', sortable: true },
        { label: 'Agency Id', key: 'agencyId', sortable: true },
        { label: 'TXN Type', key: 'txnType', sortable: true },
        { label: 'Top Up / Reverse', key: 'topUpReverse', sortable: true },
        { label: 'Current Balance', key: 'currentBalance', sortable: true },
        { label: 'Previous Balance', key: 'previousBalance', sortable: true },
        { label: 'TXN Date', key: 'txnDate', sortable: true },
    ], []);

    const handleSearch = () => {
        const filtered = walletData.filter(item =>
            item.agencyName.toLowerCase().includes(search.toLowerCase()) ||
            item.agencyId.includes(search)
        );
        setFilteredData(filtered);
    };

    return (
        <AuthUserReusableCode pageTitle="Wallet History" isLoading={isLoading}>
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

export default WalletHistory;
