'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getAgenciesWithDiscom, getLevels } from '@/app/api-calls/department/api';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { urlsListWithTitle } from '@/lib/utils';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const ViewBalance = () => {
    const { data: session } = useSession()
    const [agencyList, setAgencyList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [workingLevelList, setWorkingLevelList] = useState([])
    const [selectedRow, setSelectedRow] = useState<any | null>(null);

    const router = useRouter()

    useEffect(() => {
        getAgencyList();
    }, []);

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId);
            const discomList = await getLevels(session?.user?.discomId);
            const listOfLevel = discomList.data.reduce((acc, item) => {
                acc[item.id] = item.levelName;
                return acc;
            }, {});
            const levelOptions = discomList.data
                .filter((item) => item.levelType === "MAIN")
                .map((item) => ({
                    label: item.levelName,
                    value: item.levelName,
                }));
            let data = [{ label: 'All', value: 'all' }, ...levelOptions];
            setWorkingLevelList(data)
            setAgencyList(
                response?.data?.map((item) => {
                    let data = [];
                    if (item.collection_type_energy) {
                        data.push('Enengy')
                    }
                    if (item.collection_type_non_energy) {
                        data.push('Non-Enengy')
                    }

                    item.non_energy_types.map((mode) => data.push(mode.type_name))

                    return ({
                        id: item.id,
                        agencyName: item.agency_name,
                        agencyAddress: item.agency_address,
                        contactPerson: item.contact_person,
                        phone: item.phone,
                        maxLimit: item.maximum_limit,
                        woNumber: item.wo_number,
                        validity: item.validity_end_date,
                        workingOffice: listOfLevel[item.working_level] || 'N/A',
                        workingLevelOffice: item.working_level_offices.map((mode) => mode.office_description).join(', ') || 'N/A',
                        permissions: item.collection_payment_modes.map((mode) => mode.mode_name).join(", ") || 'N/A',
                        collectionModes: data.join(', ') || 'N/A',
                        isActive: item.is_active,
                        current_balance: item.current_balance
                    })
                })
            );
        } catch (error) {
            console.error('Failed to get agency:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(
        () => [
            { label: 'Agency ID', key: 'id', sortable: true },
            { label: 'Agency Name', key: 'agencyName', sortable: true },
            { label: 'Working level', key: 'workingOffice', sortable: true },
            { label: 'Working office', key: 'workingLevelOffice', sortable: true },
            { label: 'Current Balance', key: 'current_balance', sortable: true, align: 'center' },
            // { label: 'Action', key: 'action', sortable: false, ignored: true },
        ],
        []
    );

    const tableData = agencyList.map((item, index) => ({
        ...item,
        // action: (
        //     <div className="flex gap-2">
        //         <Button variant="default" size="sm" onClick={() => router.push(`${urlsListWithTitle.agencyBalanceHistory.url}?id=${item.id}`)}>
        //             View History
        //         </Button>
        //         <Button variant="success" size="sm" onClick={() => router.push(`${urlsListWithTitle.agencyRecharge.url}?id=${item.id}`)}>
        //             Recharge
        //         </Button>
        //         <Button variant="destructive" size="sm" onClick={() => router.push(`${urlsListWithTitle.agencyRecharge.url}?id=${item.id}&type=${'reverse'}`)}>
        //             Reverse
        //         </Button>
        //     </div>
        // ),
    }));

    const handleRowSelection = (row: any) => {
        setSelectedRow(row)
    }

    const getSelectedRowButton = () => {
        return <div className="space-x-2">
            <Button variant="default" onClick={() => router.push(`${urlsListWithTitle.agencyBalanceHistory.url}?id=${selectedRow.id}&name=${selectedRow?.agencyName}`)}>
                View History
            </Button>
            <Button variant="success" onClick={() => router.push(`${urlsListWithTitle.agencyRecharge.url}?id=${selectedRow.id}`)}>
                Recharge
            </Button>
            <Button variant="destructive" onClick={() => router.push(`${urlsListWithTitle.agencyRecharge.url}?id=${selectedRow.id}&type=${'reverse'}`)}>
                Reverse
            </Button>
        </div>
    }

    return (
        <AuthUserReusableCode pageTitle="View Balance" isLoading={isLoading}>
            <ReactTable
                data={tableData}
                columns={columns}
                defaultSortField="agencyName"
                defaultSortOrder="asc"
                isSelectable={true}
                onRowSelect={handleRowSelection}
                onRowSelectButtons={
                    getSelectedRowButton()
                }
                selectedRow={selectedRow}
            />

        </AuthUserReusableCode>
    );
};

export default ViewBalance;
