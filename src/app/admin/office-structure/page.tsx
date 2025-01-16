'use client';

import React, { useState, useEffect } from 'react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CreateNewLevelPopup from '@/components/OfficeStructure/CreateNewLevelPopup';
import CreateNewLevelUploadPopup from '@/components/OfficeStructure/CreateNewLevelUploadPopup';

const OfficeStructurePage = () => {
    const [officeStructureData, setOfficeStructureData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOfficeStructureData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/office-structure-levels/5667`);
            if (!response.ok) {
                throw new Error('Failed to fetch office structure data');
            }
            const data = await response.json();
            setOfficeStructureData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOfficeStructureData();
    }, []);

    const filteredOfficeStructureData = officeStructureData.filter(
        (item) =>
            item.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthUserReusableCode pageTitle="Office Structure">
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <CreateNewLevelPopup />
                    <CreateNewLevelUploadPopup />
                    <Input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                    />
                </div>
                <div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
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
                    )}
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default OfficeStructurePage;
