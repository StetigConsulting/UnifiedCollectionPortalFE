'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

const CounterCollectorReport = () => {
    const [division, setDivision] = useState('');
    const [search, setSearch] = useState('');
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            const response = [
                {
                    division: 'KORAPUT',
                    agencyName: 'M/S BUDDHAM BIJLIDERSKED',
                    collector: 'Manja Khosala',
                    mobileNumber: '7738141576',
                },
                {
                    division: 'KORAPUT',
                    agencyName: 'M/S BUDDHAM BIJLIDERSKED',
                    collector: 'Manja Khosala',
                    mobileNumber: '7738141576',
                },
                // Add more rows here as needed...
            ];
            setReportData(response);
            setFilteredData(response);
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'Division', key: 'division', sortable: true },
        { label: 'Agency Name', key: 'agencyName', sortable: true },
        { label: 'Collector', key: 'collector', sortable: true },
        { label: 'Mobile Number', key: 'mobileNumber', sortable: true },
    ], []);

    const handleSearch = () => {
        const filtered = reportData.filter(item =>
            item.agencyName.toLowerCase().includes(search.toLowerCase()) ||
            item.collector.toLowerCase().includes(search.toLowerCase()) ||
            item.mobileNumber.includes(search)
        );
        setFilteredData(filtered);
    };

    return (
        <AuthUserReusableCode pageTitle="Counter Collector Report" isLoading={isLoading}>
            <ReactTable
                data={filteredData}
                columns={columns}
            />
        </AuthUserReusableCode>
    );
};

export default CounterCollectorReport;
