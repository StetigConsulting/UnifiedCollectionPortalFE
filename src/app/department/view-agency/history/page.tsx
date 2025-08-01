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
import { getErrorMessage, tableDataPerPage } from '@/lib/utils';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { viewHistorySchema, ViewHistorySchemaData } from '@/lib/zod';

const ViewHistory = () => {
    const [balanceList, setBalanceList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        fromDate: '',
        toDate: ''
    });
    const [currentPage, setCurrentPage] = useState(1)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        watch
    } = useForm<ViewHistorySchemaData>({
        resolver: zodResolver(viewHistorySchema),
    });

    useEffect(() => {
        // let date = getDefaultDates()
        // setDateRange(date);
        // getBalanceHistory({ from_date: date.fromDate, to_date: date.toDate });
    }, []);

    const getDefaultDates = () => ({
        fromDate: moment().subtract(1, "months").startOf("month").format("YYYY-MM-DD"),
        toDate: moment().subtract(1, "months").endOf("month").format("YYYY-MM-DD"),
    });

    const onSubmit = async (data: ViewHistorySchemaData) => {
        await getBalanceHistory({}, 1)
    }

    const formData = watch()

    const getBalanceHistory = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: currentPage,
            page_size: tableDataPerPage,
            filter: {
                entity_type: "Agency",
                from_date: formData?.fromDate,
                to_date: formData?.toDate,
                entity_id: idFromUrl
            }
        }

        payload = {
            ...payload,
            filter: {
                ...payload.filter,
                ...applyFilter
            },
            page
        }

        try {
            setIsLoading(true);
            const response = await getBalanceHistoryAgencyById(payload);
            setBalanceList(response.data.logs);
            setCurrentPage(page);
            setIsLoading(false);
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
        }
    }

    const handlePageChange = (page: number) => {
        getBalanceHistory({}, page)
    }

    const columns = useMemo(
        () => [
            { label: "Txn Type", key: "transaction_type", sortable: true },
            { label: "TID", key: "transaction_id", sortable: true },
            { label: "Transaction By", key: "created_by_user", sortable: true },
            { label: "Amount", key: "transaction_amount", sortable: true, align: "right" },
            { label: "Current Balance", key: "balance_after_txn", sortable: true, align: "right" },
            { label: "Remark", key: "remarks", sortable: false },
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
        payDate: moment(item.created_on).format('DD-MM-YYYY'),
        entryDate: moment(item.created_on).format('DD-MM-YYYY, HH:mm A'),
    }));


    const router = useRouter();

    const searchParams = useSearchParams();
    const idFromUrl = searchParams.get('id');
    const nameFromUrl = searchParams.get('name');

    return (
        <AuthUserReusableCode pageTitle="View History" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-7 gap-4">
                <CustomizedInputWithLabel
                    label="From Date"
                    containerClass='col-span-3'
                    type='date'
                    {...register("fromDate")}
                    errors={errors.fromDate}
                />
                <CustomizedInputWithLabel
                    label="To Date"
                    containerClass='col-span-3'
                    type='date'
                    {...register("toDate")}
                    errors={errors.toDate}
                />
                <Button className={`self-end ${errors.fromDate || errors.toDate ? 'mb-5' : ''}`} type='submit'>
                    Apply Filter
                </Button>
            </form>
            {tableData.length > 0 &&
                <ReactTable
                    additionalDataBetweenTableAndAction={<div className='px-4 py-2 mb-4 text-sm rounded-md bg-lightThemeColor' style={{
                        background: 'rgba(197, 211, 233, 0.2)'
                    }}>
                        Viewing History of Agency ID {idFromUrl} - {nameFromUrl}
                    </div>}
                    // additionalData={ }
                    data={tableData}
                    columns={columns}
                    fileName='ViewAgencyHistory'
                    dynamicPagination
                    itemsPerPage={tableDataPerPage}
                    pageNumber={currentPage}
                    onPageChange={handlePageChange}
                />
            }

        </AuthUserReusableCode >
    );
};

export default ViewHistory;
