'use client';

import React, { useState } from 'react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CreateNewLevelPopup from '@/components/OfficeStructure/CreateNewLevelPopup';

const mockOfficeStructureData = [
    {
        level: "Level 1",
        name: "Level 1 Name",
        createdAt: "20-12-2024 1:00 PM",
    },
    {
        level: "Level 2",
        name: "Level 2 Name",
        createdAt: "20-12-2024 1:00 PM",
    },
    {
        level: "Level 3",
        name: "Level 3 Name",
        createdAt: "20-12-2024 1:00 PM",
    },
];

const OfficeStructurePage = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOfficeStructureData = mockOfficeStructureData.filter((item) =>
        item.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthUserReusableCode pageTitle="Office Structure">
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <CreateNewLevelPopup />

                    <Input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                    />
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Level</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOfficeStructureData.map((item, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                    <TableCell>{item.level}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.createdAt}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default OfficeStructurePage;
