'use client';

import { activateAgencyAccount, deactivateAgencyAccountAPI, getAgenciesWithDiscom } from '@/app/api-calls/department/api';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { testDiscom } from '@/lib/utils';
import { UserCheck, UserX } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const mockData = [
    {
        agencyId: "21100100229012",
        agencyName: "MBC Pace Computer BED-1",
        address: "Kolkata 401018 Vendor Code GSTIN: 23456781",
        name: "Rashmita Nayak",
        phone: "9999999999",
        maxLimit: "1500000",
        woNumber: "211001002290",
        validity: "06-12-2024",
        divCode: "Berhampur-1",
        permissions: "Cash, Cheque, DD",
        collectionModes: "Energy, Non Energy, NSC, CSC, DND, FRM",
    },
];

const ViewAgency = () => {
    const [search, setSearch] = useState("");
    const [agencyList, setAgencyList] = useState([])

    const filteredData = agencyList?.filter((item) =>
        item.agencyName?.toLowerCase()?.includes(search.toLowerCase())
    );

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getAgencyList()
    }, [])

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(testDiscom);
            console.log("API Response:", response);
            setAgencyList(
                response?.data?.map((item) => ({
                    ...item,
                    label: item.agency_name,
                    value: item.id,
                }))
            );

        } catch (error) {
            console.error("Failed to get agency:", error.data[Object.keys(error.data)[0]]);
        } finally {
            setIsLoading(false);
        }
    }

    const activateAgencyUser = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await activateAgencyAccount(id);
            console.log("API Response:", response);
            toast.success("Agency activated successfully");
            getAgencyList();
        } catch (error) {
            console.error("Failed to create agency:", error.data[Object.keys(error.data)[0]] || error.error);
        } finally {
            setIsLoading(false);
        }
    }

    const deactivateAgencyUser = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await deactivateAgencyAccountAPI(id);
            console.log("API Response:", response);
            toast.success("Agency deactivated successfully");
            getAgencyList();
        } catch (error) {
            console.error("Failed to create agency");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthUserReusableCode pageTitle="View Agency" isLoading={isLoading}>
            <div className="p-4 space-y-4">
                <header className="flex justify-between items-center">
                    <div className="flex space-x-2">
                        <Button type="button" variant="default">
                            View
                        </Button>
                        <Button type="button" variant="default">
                            Excel
                        </Button>
                        <Button type="button" variant="default">
                            CSV
                        </Button>
                        <Button type="button" variant="default">
                            PDF
                        </Button>
                    </div>
                    <Input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                </header>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>S.No.</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Agency ID</TableHead>
                                <TableHead>Agency Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Max Limit</TableHead>
                                <TableHead>WO Number</TableHead>
                                <TableHead>Validity</TableHead>
                                <TableHead>Div Code</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Collection Modes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agencyList.map((item, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        {!item.is_active ?
                                            <UserCheck onClick={() => { activateAgencyUser(item.id) }} className='cursor-pointer' />
                                            : <UserX onClick={() => { deactivateAgencyUser(item.id) }} className='cursor-pointer' />}
                                    </TableCell>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.agency_name}</TableCell>
                                    <TableCell>{item.agency_address}</TableCell>
                                    <TableCell>{item.contact_person}</TableCell>
                                    <TableCell>{item.phone}</TableCell>
                                    <TableCell>{item.maximum_limit}</TableCell>
                                    <TableCell>{item.wo_number}</TableCell>
                                    <TableCell>{item.validity_end_date}</TableCell>
                                    <TableCell>{item.divCode}</TableCell>
                                    <TableCell>{item.permissions}</TableCell>
                                    <TableCell>{item.collectionModes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

            </div>
        </AuthUserReusableCode>
    );
};

export default ViewAgency;
