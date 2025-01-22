'use client';

import React, { useState, useEffect } from 'react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CreateNewLevelPopup from '@/components/OfficeStructure/CreateNewLevelPopup';
import CreateNewLevelUploadPopup from '@/components/OfficeStructure/CreateNewLevelUploadPopup';
import { formatDate, testDiscom } from '@/lib/utils';
import { toast } from 'sonner';

const OfficeStructurePage = () => {
    const [officeStructureData, setOfficeStructureData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOfficeStructureData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/office-structure-levels/${testDiscom}`);
            if (!response.ok) {
                throw new Error('Failed to fetch office structure data');
            }
            const data = await response.json();

            setOfficeStructureData(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error(err.message);
            toast.error(err.message);
            setOfficeStructureData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOfficeStructureData();
    }, []);

    const filteredOfficeStructureData = officeStructureData.filter(
        (item) =>
            item.levelType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.levelName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthUserReusableCode pageTitle="Office Structure">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className='flex space-x-4'>
                        <CreateNewLevelPopup fetchData={fetchOfficeStructureData} />
                        <CreateNewLevelUploadPopup fetchData={fetchOfficeStructureData} />
                    </div>

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
                    ) : filteredOfficeStructureData.length > 0 ? (
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
                                    <TableRow key={item.id} className="hover:bg-gray-50">
                                        <TableCell>{item.levelType}</TableCell>
                                        <TableCell>{item.levelName}</TableCell>
                                        <TableCell>{formatDate(item.createdOn)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p>No data found</p>
                    )}
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default OfficeStructurePage;
