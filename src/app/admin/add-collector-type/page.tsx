'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { getErrorMessage, urlsListWithTitle } from '@/lib/utils';
import { FileCog } from 'lucide-react';
import { getCollectorTypes } from '@/app/api-calls/agency/api';

const CollectorTypeConfiguration = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [collectorTypes, setCollectorTypes] = useState([]);

    const columns = [
        { label: 'Sr. No.', key: 'id', sortable: true },
        { label: 'Collector Type', key: 'name', sortable: true },
    ];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await getCollectorTypes();
            setCollectorTypes(response.data);
        } catch (error) {
            console.error('Error fetching collector types:', error);
            toast.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <AuthUserReusableCode pageTitle="Add Collector Type" isLoading={isLoading}>
            <div className='p-4'>
                <div className="flex justify-start mb-4">
                    <Button variant="default" size="lg"
                        onClick={() => router.push(urlsListWithTitle.collectorTypeAdd.url)}
                    >
                        <FileCog />Setup Collector Type
                    </Button>
                </div>

                <ReactTable
                    data={collectorTypes}
                    columns={columns}
                    hideSearchAndOtherButtons
                    avoidSrNo
                />
            </div>
        </AuthUserReusableCode>
    );
};

export default CollectorTypeConfiguration;
