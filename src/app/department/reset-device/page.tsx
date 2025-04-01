'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { resetDeviceSchema } from "@/lib/zod";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { number, z } from "zod";
import { useSession } from "next-auth/react";
import { getRegisteredDevices, getResetHistoryByAgencyId, resetDeviceById } from "@/app/api-calls/agency/api";
import { getAgentByPhoneNumber } from "@/app/api-calls/department/api";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatDate, getErrorMessage } from "@/lib/utils";
import ReactTable from "@/components/ReactTable";
import moment from "moment";

type FormData = z.infer<typeof resetDeviceSchema>;


const mockPreviousHistoryData = [
    {
        userName: "Satyam Pattnaik",
        collectorName: "Satyam Aryaan Kumar",
        mobileNumber: "7738414900",
        deviceInfo: "iPhone 16 Pro Max",
        reason: "Active",
        date: "06-01-2024",
    },
];

const ResetDeviceCollector = () => {

    const { data: session } = useSession()

    const { register, handleSubmit, formState: { errors }, setValue, watch, setError, clearErrors } = useForm<FormData>({
        resolver: zodResolver(resetDeviceSchema),
        defaultValues: {
            mobileNumber: null,
            collectorName: "",
            agencyName: "",
            collectorType: null,
        },
    });

    const onSubmit = async (data: FormData) => {
        console.log(collectorId)
        setIsLoading(true)
        try {
            const response = await resetDeviceById(collectorId)
            toast.success('Device Reset done Successfully')
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    };

    const formData = watch()

    const [collectorType, setCollectorType] = useState([])
    const [collectorId, setCollectorId] = useState(null)
    const [deviceData, setDeviceData] = useState([])
    const [historyLog, setHistoryLog] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const deviceDataColumn = useMemo(() => [
        { label: 'Collector Name', key: 'user_name', sortable: true },
        { label: 'Mobile Number', key: 'mobile_number', sortable: true },
        { label: 'Device ID', key: 'device_id', sortable: true },
        { label: 'Device Name', key: 'device_name', sortable: true },
        { label: 'Status', key: 'deviceStatus', sortable: true },
        { label: 'App Version', key: 'app_version', sortable: true },
    ], []);

    const historyLogColumn = useMemo(() => [
        { label: 'Collector Name', key: 'user_name', sortable: true },
        { label: 'Mobile Number', key: 'mobile_number', sortable: true },
        { label: 'Device ID', key: 'device_id', sortable: true },
        { label: 'Device Name', key: 'device_name', sortable: true },
        { label: 'Reason', key: 'reason', sortable: true },
        { label: 'Status', key: 'deviceStatus', sortable: true },
        { label: 'Date', key: 'date', sortable: true },
    ], []);

    const [showTable, setShowTable] = useState(false)

    const handleSearch = async () => {
        const mobileNumber = Number(watch('mobileNumber'));
        if (!isNaN(mobileNumber) && mobileNumber.toString().length === 10) {
            setIsLoading(true)
            try {
                const response = await getAgentByPhoneNumber(mobileNumber)
                setCollectorType([{ id: response?.data?.collector_type?.id, label: response?.data?.collector_type?.name }]);
                const registeredResponse = await getRegisteredDevices(response?.data?.id);
                const historyResponse = await loadHistoryLog(response?.data?.id)
                console.log(historyResponse)
                setCollectorId(response?.data?.id)
                setValue("collectorName", response?.data?.agent_name);
                setValue("agencyName", response?.data?.agent_name);
                setShowTable(true)
                let arrData = [];
                arrData.push(registeredResponse.data)
                arrData = arrData.map(item => ({
                    ...item,
                    deviceStatus: item?.is_device_active ? 'Active' : 'Inactive'
                }))
                setDeviceData(arrData || [])
                setValue('collectorType', response?.data?.collector_type?.id);
            } catch (error) {
                toast.error('Error: ' + getErrorMessage(error))
                setValue("collectorName", '');
                setValue("agencyName", '');
                setValue('collectorType', null);
                setShowTable(false)
            } finally {
                setIsLoading(false)
            }
        } else {
            setError("mobileNumber", {
                type: "manual",
                message: "Please enter a valid 10-digit mobile number.",
            });
            return;
        }
    };

    const loadHistoryLog = async (id: number) => {
        setIsLoading(true)
        try {
            const response = await getResetHistoryByAgencyId(id)

            setHistoryLog(response?.data.map(item => ({
                ...item,
                deviceStatus: item?.status ? 'Active' : 'Inactive',
                date: moment(item?.created_on).format('DD-MM-YYYY')
            })))
        } catch (error) {
            console.log('Error: ' + getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthUserReusableCode pageTitle="Reset Device (Collector)" isLoading={isLoading}>
            <form className="space-y-4 p-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Collector Mobile"
                        type="text"
                        required
                        {...register('mobileNumber', { valueAsNumber: true })}
                        onChange={() => {
                            clearErrors("mobileNumber")
                        }}
                        errors={errors.mobileNumber}
                    />
                    <Button type="button" variant="default"
                        className={`self-end ${errors?.mobileNumber && 'mb-5'}`} onClick={handleSearch}>
                        Search
                    </Button>
                    <CustomizedInputWithLabel
                        label="Collector Name"
                        placeholder="Collector Name"
                        {...register("collectorName")}
                        disabled
                    />
                    <CustomizedSelectInputWithLabel
                        label="Collector Type"
                        list={collectorType}
                        // placeholder="Collector Type"
                        {...register("collectorType")}
                        errors={errors.collectorType}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        placeholder="Agency Name"
                        {...register("agencyName")}
                        disabled
                    />

                    <Button type="submit" variant="default" disabled={!formData?.collectorName} className={`self-end`}>
                        Reset
                    </Button>
                </div>

            </form>
            {
                showTable && <div className="p-4">
                    <h2 className="text-lg font-bold">Registered Mobile Number With This Device</h2>
                    <div className="overflow-x-auto mt-4">
                        <ReactTable
                            data={deviceData}
                            columns={deviceDataColumn}
                            hideSearchAndOtherButtons
                        />
                    </div>

                    <h2 className="text-lg font-bold mt-8">Previous Mobile History Reset Data</h2>
                    <div className="overflow-x-auto mt-4">
                        <ReactTable
                            data={historyLog}
                            columns={historyLogColumn}
                            hideSearchAndOtherButtons
                        />
                    </div>
                </div>
            }

        </AuthUserReusableCode>
    );
};

export default ResetDeviceCollector;
