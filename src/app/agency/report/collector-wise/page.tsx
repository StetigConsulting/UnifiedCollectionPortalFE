'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';

const CollectorWiseReport = () => {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [division, setDivision] = useState('');
    const [dateType, setDateType] = useState('');
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
                    agencyId: '35180903146250',
                    agencyName: 'AED-1 (SANGRACH CC)',
                    divisionCode: '351',
                    subDivision: 'SANGRACH CC',
                    section: '3426',
                    agentId: '7738141900',
                    mobileNumber: '7738141900',
                    agentName: 'Bani Bihar',
                    totalMR: '0',
                    totalCollection: '0',
                    binderAllocated: '0',
                    binderTouched: '0',
                    agentType: 'Counter Collector',
                    collectionType: 'Collector',
                },
                // more rows...
            ];
            setReportData(response);
            setFilteredData(response);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data.');
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'Agency Id', key: 'agencyId', sortable: true },
        { label: 'Agency Name', key: 'agencyName', sortable: true },
        { label: 'Division Code', key: 'divisionCode', sortable: true },
        { label: 'Sub Division', key: 'subDivision', sortable: true },
        { label: 'Section', key: 'section', sortable: true },
        { label: 'Agent ID', key: 'agentId', sortable: true },
        { label: 'Mobile Number', key: 'mobileNumber', sortable: true },
        { label: 'Agent Name', key: 'agentName', sortable: true },
        { label: 'Total MR', key: 'totalMR', sortable: true },
        { label: 'Total Collection', key: 'totalCollection', sortable: true },
        { label: 'Binder Allocated', key: 'binderAllocated', sortable: true },
        { label: 'Binder Touched', key: 'binderTouched', sortable: true },
        { label: 'Agent Type', key: 'agentType', sortable: true },
        { label: 'Collection Type', key: 'collectionType', sortable: true },
    ], []);

    const handleSearch = () => {
        const filtered = reportData.filter(item => {
            const itemDate = new Date(item.txnTime);
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);

            const isDateInRange =
                (!dateFrom || itemDate >= fromDate) && (!dateTo || itemDate <= toDate);

            return isDateInRange &&
                (division ? item.divisionCode.includes(division) : true) &&
                (dateType ? item.dateType === dateType : true);
        });
        setFilteredData(filtered);
    };

    return (
        <AuthUserReusableCode pageTitle="Collector Wise Report" isLoading={isLoading}>
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
                <CustomizedInputWithLabel
                    label="Division"
                    type="text"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                />
                <CustomizedInputWithLabel
                    label="Date Type"
                    type="text"
                    value={dateType}
                    onChange={(e) => setDateType(e.target.value)}
                />
                <div className="col-span-4 text-end">
                    <Button variant='default'
                        onClick={handleSearch}
                    >
                        Search
                    </Button>
                </div>
            </div>

            <ReactTable
                data={filteredData}
                columns={columns}
            />

        </AuthUserReusableCode>
    );
};

export default CollectorWiseReport;
