'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { useState } from 'react';

const mockData = [
    {
        agencyId: "21100100229012",
        agencyName: "MBC Pace Computer BED-1",
        division: "Berhampur-1",
        currentBalance: "₹18,990.00",
    },
    // Add more mock data if needed
];

const ViewBalance = () => {
    const [search, setSearch] = useState("");

    const filteredData = mockData.filter((item) =>
        item.agencyName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthUserReusableCode pageTitle="View Balance">
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
                                <TableHead>Division</TableHead>
                                <TableHead>Current Balance</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((item, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                    <TableCell>{item.agencyId}</TableCell>
                                    <TableCell>{item.agencyName}</TableCell>
                                    <TableCell>{item.division}</TableCell>
                                    <TableCell>{item.currentBalance}</TableCell>
                                    <TableCell className="flex space-x-2">
                                        <Button variant="outline" size="sm">
                                            View History
                                        </Button>
                                        <Button variant="success" size="sm">
                                            Recharge
                                        </Button>
                                        <Button variant="destructive" size="sm">
                                            Reverse
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default ViewBalance;
