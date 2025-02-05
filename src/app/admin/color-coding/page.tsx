'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import ReactTable from '@/components/ReactTable'; // Referencing your reusable table component
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
            <div className='p-4'>
                <TabForRouting router={router} />
            </div>
        </AuthUserReusableCode>
    );
};

export default ColorCodingLogicTable;
