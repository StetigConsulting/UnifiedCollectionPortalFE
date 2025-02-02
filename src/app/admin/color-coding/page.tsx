'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import ReactTable from '@/components/ReactTable'; // Referencing your reusable table component
import { toast } from 'sonner';

const ColorCodingLogicTable = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [colorLogicEntries, setColorLogicEntries] = useState([]);

    const columns = [
        { label: 'CC ID', key: 'ccId', sortable: true },
        { label: 'Value 1', key: 'value1', sortable: true },
        { label: 'Value 2', key: 'value2', sortable: true },
        { label: 'BG Color', key: 'backgroundColor', sortable: true },
        { label: 'Font-type', key: 'fontType', sortable: true },
        { label: 'Font Color', key: 'fontColor', sortable: true },
        {
            label: 'Action',
            key: 'action',
            sortable: false,
        },
    ];

    const handleEdit = (index: number) => {
        toast.success('Edit functionality is not implemented yet.');
    };

    const handleDelete = (index: number) => {
        const updatedEntries = colorLogicEntries.filter((_, i) => i !== index);
        setColorLogicEntries(updatedEntries);
        toast.success('Row deleted successfully!');
    };

    const handleAdd = () => {
        setColorLogicEntries([
            ...colorLogicEntries,
            {
                ccId: 'INC000000',
                value1: '100 days',
                value2: '01-01-2026',
                backgroundColor: 'Green',
                fontType: 'Actual',
                fontColor: '#000000',
            },
        ]);
    };

    return (
        <AuthUserReusableCode pageTitle="Color Coding Logic">
            <div className="grid grid-cols-2 gap-4 mb-4">
                <Button variant="default" size="lg" className="w-full" onClick={() => router.push('/admin/color-coding/add-logic')}>
                    Color Coding Logic
                </Button>
                <Button variant="default" size="lg" className="w-full" onClick={() => router.push('/admin/color-coding/ecl-flag-customer')}>
                    ECL Flagged Customer
                </Button>
            </div>

            <ReactTable
                data={colorLogicEntries}
                columns={columns}
                hideSearchAndOtherButtons
            />

            <div className="mt-6 text-end space-x-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" variant="default" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                        </>
                    ) : (
                        'Save'
                    )}
                </Button>
            </div>
        </AuthUserReusableCode>
    );
};

export default ColorCodingLogicTable;
