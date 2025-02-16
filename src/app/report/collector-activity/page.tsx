'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';

const CollectorActivityReport = () => {
    const [date, setDate] = useState('');
    const [search, setSearch] = useState('');
    const [activityData, setActivityData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchActivityData();
    }, []);

    const fetchActivityData = async () => {
        setIsLoading(true);
        try {
            const response = [
                {
                    agencyName: 'M/S Buddham Builders KLD',
                    collectorId: '1000000000',
                    collectorMobileNo: '7738141900',
                    collectorName: 'Laxmikant Bissoyi',
                    collectorType: 'Collector',
                    loginTime: '06:12:2024 16:43',
                    logoutTime: '06:12:2024 18:00',
                },
                {
                    agencyName: 'M/S Buddham Builders KLD',
                    collectorId: '7738141900',
                    collectorMobileNo: '7738141900',
                    collectorName: 'Laxmikant Bissoyi',
                    collectorType: 'Collector',
                    loginTime: '06:12:2024 16:43',
                    logoutTime: '06:12:2024 18:00',
                },
                // Add more rows here as needed...
            ];
            setActivityData(response);
            setFilteredData(response);
        } catch (error) {
            console.error('Error fetching activity data:', error);
            toast.error('Failed to load activity data.');
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'Agency Name', key: 'agencyName', sortable: true },
        { label: 'Collector Id', key: 'collectorId', sortable: true },
        { label: 'Collector Mobile Number', key: 'collectorMobileNo', sortable: true },
        { label: 'Collector Name', key: 'collectorName', sortable: true },
        { label: 'Collector Type', key: 'collectorType', sortable: true },
        { label: 'Login Time', key: 'loginTime', sortable: true },
        { label: 'Logout Time', key: 'logoutTime', sortable: true },
    ], []);

    const handleSearch = () => {
        const filtered = activityData.filter(item =>
            item.agencyName.toLowerCase().includes(search.toLowerCase()) ||
            item.collectorName.toLowerCase().includes(search.toLowerCase()) ||
            item.collectorMobileNo.includes(search)
        );
        setFilteredData(filtered);
    };

    return (
        <AuthUserReusableCode pageTitle="Collector Activity Report" isLoading={isLoading}>
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

export default CollectorActivityReport;
