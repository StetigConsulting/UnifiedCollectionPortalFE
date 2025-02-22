'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const IncentivePage = () => {
    const [incentiveData, setIncentiveData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter()

    useEffect(() => {
        fetchIncentiveList();
    }, []);

    const fetchIncentiveList = async () => {
        setIsLoading(true);
        try {
            const response = [
                {
                    incentiveId: 'INC123456',
                    applicableLabel: 'Example Label 1',
                    circle: 'Circle A',
                    division: 'Division 1',
                    subDivision: 'SubDivision A',
                    section: 'Section 1',
                    currentPercentage: '10%',
                    arrearPercentage: '5%',
                },
                {
                    incentiveId: 'INC654321',
                    applicableLabel: 'Example Label 2',
                    circle: 'Circle B',
                    division: 'Division 2',
                    subDivision: 'SubDivision B',
                    section: 'Section 2',
                    currentPercentage: '15%',
                    arrearPercentage: '8%',
                },
            ];
            setIncentiveData(response);
        } catch (error) {
            console.error('Error fetching top-up history:', error);
            toast.error('Failed to load top-up history.');
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { label: 'Incentive ID', key: 'incentiveId', sortable: true },
        { label: 'Applicable Label', key: 'applicableLabel', sortable: true },
        { label: 'Circle', key: 'circle', sortable: true },
        { label: 'Division', key: 'division', sortable: true },
        { label: 'Sub Division', key: 'subDivision', sortable: true },
        { label: 'Section', key: 'section', sortable: true },
        { label: 'Current %', key: 'currentPercentage', sortable: true },
        { label: 'Arrear %', key: 'arrearPercentage', sortable: true },
        { label: 'Action', key: 'action', sortable: false }
    ], []);

    return (
        <AuthUserReusableCode pageTitle="Incentive">
            <div className="overflow-x-auto">
                <ReactTable
                    data={incentiveData}
                    columns={columns}
                    hideSearchAndOtherButtons
                />
            </div>

            <div className="mt-4 text-right">
                <Button variant="default" onClick={() => { router.push('/admin/incentive/add') }} size="lg">
                    Add Incentive
                </Button>
            </div>
        </AuthUserReusableCode>
    );
};

export default IncentivePage;
