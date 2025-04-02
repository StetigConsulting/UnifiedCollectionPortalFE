"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { agencyBankDepositSchema, AgencyBankDepositFormData } from "@/lib/zod";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { Loader2 } from "lucide-react";
import { getErrorMessage, tableDataPerPage } from "@/lib/utils";
import { addAgencyBankDeposit, getAgenciesWithDiscom, getAgencyBankDepositHistory } from "@/app/api-calls/department/api";
import { getAllBankList } from "@/app/api-calls/other/api";
import { useSession } from "next-auth/react";
import ReactTable from "@/components/ReactTable";
import moment from "moment";

const AgentBankDeposit = () => {

    const { data: session } = useSession()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        setError,
        clearErrors,
        reset
    } = useForm<AgencyBankDepositFormData>({
        resolver: zodResolver(agencyBankDepositSchema),
        defaultValues: {
            depositAmount: null,
            depositDate: '',
            txnRefNo: '',
            bank: ''
        },
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [bankList, setBankList] = useState([]);

    useEffect(() => {
        getBankList()
        getAgencyList()
        getDepositHistory()
    }, []);

    const getBankList = async () => {
        setIsLoading(true);
        try {
            const response = await getAllBankList();
            let listOfBanks = response.data.map(current => {
                return {
                    id: current.id,
                    value: current.bankName,
                    label: current.bankName,
                }
            })
            setBankList(listOfBanks)
        } catch (error) {
            console.error("Failed to get agent:", error?.data[Object.keys(error?.data)[0]]);
        } finally {
            setIsLoading(false);
        }
    }

    const onSubmit = async (data: AgencyBankDepositFormData) => {

        try {
            setIsSubmitting(true);

            let payload = {
                "discom_id": session?.user?.discomId,
                "agency_id": data.agencyId,
                "bank_name": data.bank,
                "deposit_date": data.depositDate,
                "amount": data.depositAmount,
                "deposit_document": "eterterret"
            }

            const response = await addAgencyBankDeposit(payload);

            toast.success("Agency Bank deposit added successfully");
            console.log("API Response:", response);
            reset();
            getDepositHistory()
        } catch (error) {
            let errorMessage = getErrorMessage(error);
            console.log(errorMessage)
            toast.error('Error: ' + errorMessage)
        } finally {
            setIsSubmitting(false);
        }
    };

    const [agencyList, setAgencyList] = useState([])

    const getAgencyList = async () => {
        setIsLoading(true);
        try {
            const response = await getAgenciesWithDiscom(session?.user?.discomId);
            console.log("API Response:", response);
            setAgencyList(
                response?.data?.map((item) => ({
                    ...item,
                    label: item.agency_name,
                    value: item.id,
                }))
            );

        } catch (error) {
            console.error("Failed to get agency:", error.data[Object.keys(error.data)[0]]);
        } finally {
            setIsLoading(false);
        }

    }

    const columns = useMemo(
        () => [
            { label: 'Franchise Id', key: 'agency_id', sortable: true },
            { label: 'Deposit Date', key: 'deposit_date', sortable: true },
            { label: 'Amount', key: 'amount', sortable: true },
            { label: 'Bank Name', key: 'bank_name', sortable: true },
            { label: 'UTR No.', key: 'deposit_document', sortable: true },
            { label: 'Entry Date', key: 'entryDate', sortable: true },
        ],
        []
    );

    const [currentPage, setCurrentPage] = useState(1)
    const [transactionHistory, setTransactionHistory] = useState([])

    const getDepositHistory = async (applyFilter = {}, page = 1) => {
        let payload = {
            page: currentPage,
            page_size: tableDataPerPage,
            filter: {
                discom_id: session?.user?.discomId
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
            const response = await getAgencyBankDepositHistory(payload);
            setTransactionHistory(response.data.data);
            setCurrentPage(page);
        } catch (error) {
            console.log(getErrorMessage(error))
        } finally {
            setIsLoading(false);
        }
    }

    const handlePageChange = (page: number) => {
        getDepositHistory({}, page)
    }

    const tableData = transactionHistory.map((item) => ({
        ...item,
        entryDate: moment(item.entry_date).format('DD-MM-YYYY')
    }))

    return (
        <AuthUserReusableCode pageTitle="Agency Bank Deposit" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Select Agency"
                        errors={errors.agencyId}
                        containerClass="col-span-2"
                        placeholder="Select Agency"
                        list={agencyList}
                        required
                        // disabled={idFromUrl != null}
                        {...register("agencyId", { valueAsNumber: true })}
                    />
                    <CustomizedInputWithLabel
                        label="Deposit Amount"
                        required={true}
                        errors={errors.depositAmount}
                        {...register("depositAmount", { valueAsNumber: true })}
                    />
                    <CustomizedInputWithLabel
                        label="Deposit Date"
                        required={true}
                        errors={errors.depositDate}
                        type="date"
                        {...register("depositDate")}
                    />
                    <CustomizedInputWithLabel
                        label="Transaction Ref No"
                        required={true}
                        errors={errors.txnRefNo}
                        placeholder=""
                        {...register("txnRefNo")}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Bank Name"
                        required={true}
                        errors={errors.bank}
                        list={bankList}
                        {...register("bank")}
                    />
                </div>

                <div className="flex justify-end mt-4">
                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </div>
            </form>
            <ReactTable
                className="mt-4"
                data={tableData}
                columns={columns}
                hideSearchAndOtherButtons
                dynamicPagination
                itemsPerPage={tableDataPerPage}
                pageNumber={currentPage}
                onPageChange={handlePageChange}
            />
        </AuthUserReusableCode>
    );
};

export default AgentBankDeposit;
