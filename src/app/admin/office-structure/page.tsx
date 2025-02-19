'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import ReactTable from '@/components/ReactTable';
import CreateNewLevelPopup from '@/components/OfficeStructure/CreateNewLevelPopup';
import CreateNewLevelUploadPopup from '@/components/OfficeStructure/CreateNewLevelUploadPopup';
import { useSession } from 'next-auth/react';

const OfficeStructurePage = () => {

    const { data: session } = useSession()

    const [officeStructureData, setOfficeStructureData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [maxLevel, setMaxLevel] = useState(1);

    const fetchOfficeStructureData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/office-structure-levels/${session?.user?.discomId}`);
            if (!response.ok) throw new Error('Failed to fetch office structure data');

            const data = await response.json();
            setOfficeStructureData(
                data?.data?.map((item) => {
                    return ({
                        ...item,
                        createdOn: formatDate(item.createdOn),
                    })
                })
            );
            const maxLevel = data.data.length > 0 ? Math.max(...data.data.map((item) => item.level || 1)) + 1 : 1;
            setMaxLevel(maxLevel);
        } catch (error) {
            console.error('Error fetching data:', error.message);
            toast.error(error.message);
            setOfficeStructureData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOfficeStructureData();
    }, []);

    const columns = useMemo(
        () => [
            { label: 'Level', key: 'level', sortable: true },
            { label: 'Level Type', key: 'levelType', sortable: true },
            { label: 'Name', key: 'levelName', sortable: true },
            { label: 'Created At', key: 'createdOn', sortable: true, }
        ],
        []
    );

    return (
        <AuthUserReusableCode pageTitle="Office Structure" isLoading={loading}>
            <div className="space-y-6">
                <ReactTable data={officeStructureData} columns={columns} avoidSrNo={true}
                    additionalDataBetweenTableAndAction={<div className='px-4 py-2 mb-4 rounded-md bg-lightThemeColor' style={{
                        background: 'rgba(197, 211, 233, 0.2)'
                    }}>
                        At least one pseudo level must be defined
                    </div>}
                    customActionButton={<div className="flex space-x-4">
                        <CreateNewLevelPopup fetchData={fetchOfficeStructureData} currentLevel={maxLevel} session={session} />
                        <CreateNewLevelUploadPopup fetchData={fetchOfficeStructureData} />
                    </div>}
                    noPagination />
            </div>
        </AuthUserReusableCode >
    );
};

export default OfficeStructurePage;
