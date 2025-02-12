'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getBalanceHistoryAgencyById } from '@/app/api-calls/department/api';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import ReactTable from '@/components/ReactTable';
import AlertPopup from '@/components/Agency/ViewAgency/AlertPopup';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';

const ViewHistory = () => {
    const [balanceList, setBalanceList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        fromDate: '',
        toDate: ''
    });

    useEffect(() => {
        let date = getDefaultDates()
        setDateRange(date);
        getBalanceHistory({ from_date: date.fromDate, to_date: date.toDate });
    }, []);

    const getDefaultDates = () => ({
        fromDate: moment().subtract(1, "months").startOf("month").format("YYYY-MM-DD"),
        toDate: moment().subtract(1, "months").endOf("month").format("YYYY-MM-DD"),
    });

    const getBalanceHistory = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: 1,
            page_size: 50,
            filter: {
                entity_type: "Agency",
                from_date: dateRange.fromDate,
                to_date: dateRange.toDate,
                entity_id: idFromUrl
            }
        }

        payload = {
            ...payload,
            filter: {
                ...payload.filter,
                ...applyFilter
            }
        }

        try {
            setIsLoading(true);
            const response = await getBalanceHistoryAgencyById(payload);
            setBalanceList(response.data.logs);
            setIsLoading(false);
        } catch (error) {

        }
    }

    const columns = useMemo(
        () => [
            { label: "Txn Type", key: "transactionType", sortable: true },
            { label: "TID", key: "transactionId", sortable: true },
            { label: "Pay Mode", key: "payMode", sortable: true },
            { label: "Amount", key: "differenceAmount", sortable: true },
            { label: "Current Balance", key: "newBalance", sortable: true },
            { label: "Pay Date", key: "payDate", sortable: true },
            { label: "Remark", key: "remark", sortable: false },
            { label: "Entry Date", key: "entryDate", sortable: true },
        ],
        []
    );

    const tableData = balanceList.map((item, index) => ({
        ...item,
        differenceAmount:
            <p className={`font-bold ${item.newBalance - item.previousBalance > 0 ? "text-green-500" : "text-red-500"}`}>
                {item.newBalance - item.previousBalance > 0 ? `+${item.newBalance - item.previousBalance}` : item.newBalance - item.previousBalance}
            </p>,
        payDate: moment(item.createdOn).format('DD-MM-YYYY'),
        entryDate: moment(item.createdOn).format('DD-MM-YYYY, HH:mm A'),
    }));


    const router = useRouter();

    const searchParams = useSearchParams();
    const idFromUrl = searchParams.get('id');

    return (
        <AuthUserReusableCode pageTitle="View History" isLoading={isLoading}>
            <ReactTable
                additionalData={<div className="grid grid-cols-7 gap-4">
                    <CustomizedInputWithLabel
                        label="From Date"
                        containerClass='col-span-3'
                        value={dateRange.fromDate}
                        type='date'
                        onChange={(e) => setDateRange((prev) => ({ ...prev, fromDate: e.target.value }))}
                    />
                    <CustomizedInputWithLabel
                        label="To Date"
                        containerClass='col-span-3'
                        value={dateRange.toDate}
                        type='date'
                        onChange={(e) => setDateRange((prev) => ({ ...prev, toDate: e.target.value }))}
                    />
                    <Button className='self-end' onClick={() => getBalanceHistory({})}>
                        Apply Filter
                    </Button>
                </div>}
                data={tableData}
                columns={columns}
                fileName='ViewAgencyHistory'
            />
            {/* pagination to be added */}
        </AuthUserReusableCode >
    );
};

export default ViewHistory;
