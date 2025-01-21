'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { activateAgencyAccount, deactivateAgencyAccountAPI, getAgenciesWithDiscom } from '@/app/api-calls/department/api';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCheck, UserX } from 'lucide-react';
import { testDiscom } from '@/lib/utils';
import ReactTable from '@/components/ReactTable';

const ViewAgency = () => {
    const [search, setSearch] = useState('');
    const [agencyList, setAgencyList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getAgencyList();
    }, []);

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(testDiscom);
            setAgencyList(
                response?.data?.map((item) => ({
                    id: item.id,
                    agencyName: item.agency_name,
                    agencyAddress: item.agency_address,
                    contactPerson: item.contact_person,
                    phone: item.phone,
                    maxLimit: item.maximum_limit,
                    woNumber: item.wo_number,
                    validity: item.validity_end_date,
                    divCode: item.divCode || 'N/A',
                    permissions: item.permissions || 'N/A',
                    collectionModes: item.collectionModes || 'N/A',
                    isActive: item.is_active,
                }))
            );
        } catch (error) {
            console.error('Failed to get agency:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const activateAgencyUser = async (id: number) => {
        setIsLoading(true);
        try {
            await activateAgencyAccount(id);
            toast.success('Agency activated successfully');
            getAgencyList();
        } catch (error) {
            console.error('Failed to activate agency:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deactivateAgencyUser = async (id: number) => {
        setIsLoading(true);
        try {
            await deactivateAgencyAccountAPI(id);
            toast.success('Agency deactivated successfully');
            getAgencyList();
        } catch (error) {
            console.error('Failed to deactivate agency:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(
        () => [
            { label: 'Action', key: 'action', sortable: false },
            { label: 'Agency ID', key: 'id', sortable: true },
            { label: 'Agency Name', key: 'agencyName', sortable: true },
            { label: 'Address', key: 'agencyAddress', sortable: true },
            { label: 'Contact Person', key: 'contactPerson', sortable: true },
            { label: 'Phone', key: 'phone', sortable: true },
            { label: 'Max Limit', key: 'maxLimit', sortable: true },
            { label: 'WO Number', key: 'woNumber', sortable: true },
            { label: 'Validity', key: 'validity', sortable: true },
            { label: 'Div Code', key: 'divCode', sortable: true },
            { label: 'Permissions', key: 'permissions', sortable: true },
            { label: 'Collection Modes', key: 'collectionModes', sortable: true },
        ],
        []
    );

    const tableData = agencyList.map((item, index) => ({
        ...item,
        action: item.isActive ? (
            <UserX
                onClick={() => deactivateAgencyUser(item.id)}
                className="cursor-pointer text-red-500"
            />
        ) : (
            <UserCheck
                onClick={() => activateAgencyUser(item.id)}
                className="cursor-pointer text-green-500"
            />
        ),
    }));

    return (
        <AuthUserReusableCode pageTitle="View Agency" isLoading={isLoading}>
            <div className="p-4 space-y-4">
                <header className="flex justify-between items-center">
                    <div className="flex space-x-2">
                        <Button variant="default">View</Button>
                        <Button variant="default">Excel</Button>
                        <Button variant="default">CSV</Button>
                        <Button variant="default">PDF</Button>
                    </div>
                    <Input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                </header>

                <ReactTable
                    data={tableData.filter((item) =>
                        item.agencyName.toLowerCase().includes(search.toLowerCase())
                    )}
                    columns={columns}
                    itemsPerPage={5}
                />
            </div>
        </AuthUserReusableCode>
    );
};

export default ViewAgency;
