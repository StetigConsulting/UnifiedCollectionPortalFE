'use client';

import { getAgenciesWithDiscom } from '@/app/api-calls/department/api';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { testDiscom } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

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

    const filteredData = mockData.filter((item) =>
        item.agencyName.toLowerCase().includes(search.toLowerCase())
    );

    const [agencyList, setAgencyList] = useState([])

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
            console.error("Failed to create agency:", error.data[Object.keys(error.data)[0]]);
        } finally {
            setIsLoading(false);
        }

    }

    return (
        <AuthUserReusableCode pageTitle="View Agency">
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
                            {filteredData.map((item, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                    <TableCell>{item.agencyId}</TableCell>
                                    <TableCell>{item.agencyName}</TableCell>
                                    <TableCell>{item.address}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.phone}</TableCell>
                                    <TableCell>{item.maxLimit}</TableCell>
                                    <TableCell>{item.woNumber}</TableCell>
                                    <TableCell>{item.validity}</TableCell>
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
