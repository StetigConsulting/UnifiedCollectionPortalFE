'use client';

import React, { useState } from 'react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const mockData = [
    {
        departmentId: "DPID1234SV2424",
        name: "MBC Pace Computer BED-1",
        email: "departmentemail@tp.com",
        mobileNumber: "9833076900",
        createdAt: "11-12-2024 1:00 PM",
    },
    {
        departmentId: "DPID5678SV2424",
        name: "XYZ Computers BED-2",
        email: "xyzemail@tp.com",
        mobileNumber: "9833076901",
        createdAt: "12-12-2024 1:00 PM",
    },
];

const DepartmentUserPage = () => {
    const [search, setSearch] = useState("");

    const filteredData = mockData.filter((user) =>
        user.departmentId.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.mobileNumber.includes(search)
    );

    return (
        <AuthUserReusableCode pageTitle="Department User">
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <Link href="/admin/department-user/create">
                        <Button variant="default" className="text-white">
                            Create Department User
                        </Button>
                    </Link>
                    <Input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Department ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Mobile Number</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((user, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                    <TableCell>{user.departmentId}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.mobileNumber}</TableCell>
                                    <TableCell>{user.createdAt}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default DepartmentUserPage;
