'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import ReactTable from '@/components/ReactTable';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';

const ReceiptsForPostpaid = () => {
    const router = useRouter();
    const [selectedConfig, setSelectedConfig] = useState('');
    const [levelWiseData, setLevelWiseData] = useState([]);
    const [discomWiseData, setDiscomWiseData] = useState([]);

    const handleConfigChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedConfig(e.target.value);
    };

    const levelWiseColumns = useMemo(() => [
        {
            label: 'Method ID',
            key: 'methodId',
        },
        {
            label: 'Applicable Label',
            key: 'applicableLabel',
        },
        {
            label: 'Circle',
            key: 'circle',
        },
        {
            label: 'Division',
            key: 'division',
        },
        {
            label: 'Sub Division',
            key: 'subDivision',
        },
        {
            label: 'Section',
            key: 'section',
        },
    ], []);

    const discomWiseColumns = useMemo(() => [
        {
            label: 'Method ID',
            key: 'methodId',
        },
        {
            label: 'Bills per Month',
            key: 'billsPerMonth',
        },
        {
            label: 'Bills per Day',
            key: 'billsPerDay',
        },
    ], []);

    const renderTable = () => {
        if (selectedConfig === 'Levelwise') {
            return (
                <>
                    <div className="mt-6">
                        <ReactTable
                            columns={levelWiseColumns}
                            data={levelWiseData}
                            hideSearchAndOtherButtons
                        />
                    </div>
                    <div className="mt-6 text-right space-x-4">
                        <Button variant="default" onClick={() => router.push('/admin/receipt-for-postpaid/add')}>
                            Add
                        </Button>
                    </div>
                </>
            );
        } else if (selectedConfig === 'Discom wise') {
            return (
                <>
                    <div className="mt-6">
                        <ReactTable
                            columns={discomWiseColumns}
                            data={discomWiseData}
                            hideSearchAndOtherButtons
                        />
                    </div>
                    <div className="mt-6 text-right space-x-4">
                        <Button variant="default" onClick={() => router.push('/admin/receipt-for-postpaid/add')}>
                            Add
                        </Button>
                    </div>
                </>
            );
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Receipts for Postpaid">

            <div className="space-y-4">
                <CustomizedSelectInputWithLabel
                    label="Config rule for"
                    list={[
                        { label: 'Levelwise', value: 'Levelwise' },
                        { label: 'Discom wise', value: 'Discom wise' },
                    ]}
                    value={selectedConfig}
                    onChange={handleConfigChange}
                />
            </div>

            <div>
                {renderTable()}
            </div>


        </AuthUserReusableCode>
    );
};

export default ReceiptsForPostpaid;
