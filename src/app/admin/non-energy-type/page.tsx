'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { getErrorMessage, urlsListWithTitle } from '@/lib/utils';
import { getAllNonEnergyTypes } from '@/app/api-calls/department/api';
import { FileCog } from 'lucide-react';

const NonEnergyTypeConfiguration = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [nonEnergyTypes, setNonEnergyTypes] = useState([]);

    const columns = [
        { label: 'Sr. No.', key: 'id', sortable: true },
        { label: 'Non Energy Type', key: 'type_name', sortable: true },
    ];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getAllNonEnergyTypes();
            setNonEnergyTypes(data.data);
        } catch (error) {
            console.error('Error: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <AuthUserReusableCode pageTitle="Non Energy Type" isLoading={isLoading}>
            <div className='p-4'>
                <div className="flex justify-start mb-4">
                    <Button variant="default" size="lg"
                        onClick={() => router.push(urlsListWithTitle.nonEnergyTypeForm.url)}
                    >
                        <FileCog />Setup Non Energy Type
                    </Button>
                </div>

                <ReactTable
                    data={nonEnergyTypes}
                    columns={columns}
                    hideSearchAndOtherButtons
                    avoidSrNo
                />
            </div>
        </AuthUserReusableCode>
    );
};

export default NonEnergyTypeConfiguration;
