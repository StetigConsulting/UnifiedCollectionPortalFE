'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import ReactTable from '@/components/ReactTable';

const LoginHistory = () => {
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
                {
                    agencyName: 'Agency A',
                    AgentId: 'A001',
                    agentMobileNo: '1234567890',
                    agentName: 'John Doe',
                    designation: 'Collector',
                    agentType: 'Full-Time',
                    agentStatus: 'Active',
                    createdDate: '2023-01-15',
                    activationDate: '2023-01-20',
                    deviceId: 'DEVICE123',
                    lastLoginDate: '2023-10-01',
                    lastSyncDate: '2023-10-02',
                },
                {
                    agencyName: 'Agency B',
                    AgentId: 'A002',
                    agentMobileNo: '9876543210',
                    agentName: 'Alice Johnson',
                    designation: 'Agent',
                    agentType: 'Part-Time',
                    agentStatus: 'Inactive',
                    createdDate: '2023-02-10',
                    activationDate: '2023-02-15',
                    deviceId: 'DEVICE456',
                    lastLoginDate: '2023-09-25',
                    lastSyncDate: '2023-09-30',
                },
                {
                    agencyName: 'Agency C',
                    AgentId: 'A003',
                    agentMobileNo: '5551234567',
                    agentName: 'Michael Green',
                    designation: 'Senior Collector',
                    agentType: 'Full-Time',
                    agentStatus: 'Active',
                    createdDate: '2023-03-05',
                    activationDate: '2023-03-10',
                    deviceId: 'DEVICE789',
                    lastLoginDate: '2023-10-03',
                    lastSyncDate: '2023-10-03',
                },
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
            { label: 'Agency Name', key: 'agencyName', sortable: true },
            { label: 'Agent ID', key: 'AgentId', sortable: true },
            { label: 'Agent Mobile No', key: 'agentMobileNo', sortable: true },
            { label: 'Agent Name', key: 'agentName', sortable: true },
            { label: 'Designation', key: 'designation', sortable: true },
            { label: 'Agent Type', key: 'agentType', sortable: true },
            { label: 'Agent Status', key: 'agentStatus', sortable: true },
            { label: 'Created Date', key: 'createdDate', sortable: true },
            { label: 'Activation Date', key: 'activationDate', sortable: true },
            { label: 'Device ID', key: 'deviceId', sortable: true },
            { label: 'Last Login Date', key: 'lastLoginDate', sortable: true },
            { label: 'Last Sync Date', key: 'lastSyncDate', sortable: true },
        ],
        []
    );

    const handleSearch = () => {
        const filtered = topUpData.filter(item => {
            const itemDate = new Date(item.entryDate);
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);

            const isDateInRange =
                (!dateFrom || itemDate >= fromDate) && (!dateTo || itemDate <= toDate);

            return isDateInRange;
        });
        setFilteredData(filtered);
    };

    return (
        <AuthUserReusableCode pageTitle="Login History" isLoading={isLoading}>
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

export default LoginHistory;
