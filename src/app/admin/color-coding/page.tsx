'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarDays, FileUser, Loader2, ReceiptText } from 'lucide-react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { toast } from 'sonner';
import TabForRouting from '@/components/ColorCoding/TabForRouting';

const ColorCodingLogicTable = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    return (
        <AuthUserReusableCode pageTitle="Color Coding">
            {/* <div className='p-4'> */}
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col gap-4 items-center">
                    <Button variant="default" className="w-full py-8 text-lg" onClick={() => router.push('/admin/color-coding/logic')}>
                        <CalendarDays className="h-5 w-5" /> Bill Background Color Coding based on Last Payment Date
                    </Button>
                    <Button variant="default" className="w-full py-8 text-lg" onClick={() => router.push('/admin/color-coding/bill-basis')}>
                        <ReceiptText className="h-5 w-5" /> Bill Font Color Coding based on Bill Basis
                    </Button>
                    <Button variant="default" className="w-full py-8 text-lg" onClick={() => router.push('/admin/color-coding/ecl-flag-customer')}>
                        <FileUser className="h-5 w-5" /> Bill Background Color Coding based on ECL Flagged Customers
                    </Button>
                </div>
            </div>
            {/* </div> */}
        </AuthUserReusableCode>
    );
};

export default ColorCodingLogicTable;
