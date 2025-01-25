'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';

const DeniedConsumerReport = () => {
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
                    agentNo: '351',
                    consumerNo: '713202010343',
                    division: 'MED Malkanagiri',
                    subDivision: '3426',
                    section: 'ESO MATHILI',
                    billMonth: '2022-07',
                    amount: '1294.3',
                    dueDate: '06-12-2024',
                    reason: 'Promised To Pay',
                    remarks: 'He will on 10-09-2022',
                    date: '10-09-2022',
                    latLon: '18.55461666666666',
                    entryDate: '9-01-2024 12:00:00 AM',
                },
                // More rows...
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
        { label: 'Agent No', key: 'agentNo', sortable: true },
        { label: 'Consumer No', key: 'consumerNo', sortable: true },
        { label: 'Division', key: 'division', sortable: true },
        { label: 'Sub Division', key: 'subDivision', sortable: true },
        { label: 'Section', key: 'section', sortable: true },
        { label: 'Bill Month', key: 'billMonth', sortable: true },
        { label: 'Amount', key: 'amount', sortable: true },
        { label: 'Due Date', key: 'dueDate', sortable: true },
        { label: 'Reason', key: 'reason', sortable: true },
        { label: 'Remarks', key: 'remarks', sortable: true },
        { label: 'Date', key: 'date', sortable: true },
        { label: 'Lat, Lon', key: 'latLon', sortable: true },
        { label: 'Entry Date', key: 'entryDate', sortable: true },
    ], []);

    const handleSearch = () => {
        const filtered = reportData.filter(item => {
            const itemDate = new Date(item.date);
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);

            const isDateInRange =
                (!dateFrom || itemDate >= fromDate) && (!dateTo || itemDate <= toDate);

            return isDateInRange &&
                (division ? item.division.includes(division) : true) &&
                (dateType ? item.dateType === dateType : true);
        });
        setFilteredData(filtered);
    };

    return (
        <AuthUserReusableCode pageTitle="Denied Consumer Report" isLoading={isLoading}>
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
                    <Button variant='default' onClick={handleSearch}>
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

export default DeniedConsumerReport;
