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
import { getAllAgentByAgencyId, getRegisteredDevices, getResetHistoryByAgencyId, resetDeviceById } from "@/app/api-calls/agency/api";
import { getAgenciesWithDiscom, getAgentByPhoneNumber } from "@/app/api-calls/department/api";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatDate, getErrorMessage } from "@/lib/utils";
import ReactTable from "@/components/ReactTable";
import moment from "moment";
import CustomizedSelectInputWithSearch from "@/components/CustomizedSelectInputWithSearch";

type FormData = z.infer<typeof resetDeviceSchema>;

const ResetDeviceCollector = () => {

    const { data: session } = useSession()

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, setError, clearErrors } = useForm<FormData>({
        resolver: zodResolver(resetDeviceSchema),
        defaultValues: {
            mobileNumber: null,
            collectorName: "",
            agencyName: "",
            collectorType: null,
            agency: null,
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            const response = await resetDeviceById(collectorId)
            toast.success('Device Reset done Successfully')
            setShowTable(false)
            reset()
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
        { label: 'Agent Name', key: 'user_name', sortable: true },
        { label: 'Mobile Number', key: 'mobile_number', sortable: true },
        { label: 'Device ID', key: 'device_id', sortable: true },
        { label: 'Device Name', key: 'device_name', sortable: true },
        { label: 'Status', key: 'deviceStatus', sortable: true },
        { label: 'App Version', key: 'app_version', sortable: true },
    ], []);

    const historyLogColumn = useMemo(() => [
        { label: 'Agent Name', key: 'user_name', sortable: true },
        { label: 'Mobile Number', key: 'mobile_number', sortable: true },
        { label: 'Device ID', key: 'device_id', sortable: true },
        { label: 'Device Name', key: 'device_name', sortable: true },
        { label: 'Reason', key: 'reason', sortable: true },
        { label: 'Status', key: 'deviceStatus', sortable: true },
        { label: 'Date', key: 'date', sortable: true },
        { label: 'Reset by', key: 'created_by_name' }
    ], []);

    const [showTable, setShowTable] = useState(false)

    const handleSearch = async () => {
        const mobileNumber = Number(watch('mobileNumber'));
        if (mobileNumber.toString().length === 10) {
            setIsLoading(true)
            try {
                const response = await getAgentByPhoneNumber(mobileNumber)
                // setCollectorType([{ id: response?.data?.collector_type?.id, label: response?.data?.collector_type?.name }]);
                const registeredResponse = await getRegisteredDevices(response?.data?.id);
                const historyResponse = await loadHistoryLog(response?.data?.id)
                setCollectorId(response?.data?.id)
                setValue("collectorName", response?.data?.agent_name);
                setValue("agencyName", response?.data?.agency?.agency_name);
                setShowTable(true)
                let arrData = [];
                arrData.push(registeredResponse.data)
                arrData = arrData.map(item => ({
                    ...item,
                    deviceStatus: item?.is_device_active ? 'Active' : 'Inactive'
                }))
                setDeviceData(arrData || [])
                setValue('collectorType', response?.data?.collector_type?.name);
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
                deviceStatus: 'Inactive',
                date: moment(item?.created_on).format('DD-MM-YYYY')
            })))
        } catch (error) {
            console.error('Error: ' + getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const [agencyList, setAgencyList] = useState([])
    const getAgencyList = async () => {
        setIsLoading(true)
        const response = await getAgenciesWithDiscom(session?.user?.discomId)
        setAgencyList(response?.data?.map(item => ({
            value: item?.id,
            label: item?.agency_name + ' - ' + item?.phone
        })))
        setIsLoading(false)
    }

    useEffect(() => {
        getAgencyList()
    }, [])

    const [agentList, setAgentList] = useState([])
    const getAgentList = async (id: number) => {
        setIsLoading(true)
        const response = await getAllAgentByAgencyId(id)
        setAgentList(response?.data?.map(item => ({
            value: item?.primary_phone,
            label: item?.agent_name
        })))
        setIsLoading(false)
    }

    return (
        <AuthUserReusableCode pageTitle="Reset Device (Agent)" isLoading={isLoading}>
            <form className="space-y-4 p-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithSearch
                        label="Agency"
                        required
                        list={agencyList}
                        value={formData?.agency}
                        onChange={(val: string) => {
                            setValue("agency", val);
                            setValue("mobileNumber", null);
                            if (val) {
                                getAgentList(Number(val))
                            }
                        }}
                        placeholder="Select Agency"
                        errors={errors.agency}
                    />
                    <CustomizedSelectInputWithSearch
                        label="Agent"
                        required
                        list={agentList}
                        value={formData?.mobileNumber}
                        onChange={(val: number) => {
                            setValue("mobileNumber", val);
                            clearErrors("mobileNumber")
                        }}
                        placeholder="Select Agency"
                        errors={errors.mobileNumber}
                    />
                    <div className="text-end col-span-2">
                        <Button type="button" variant="default"
                            className={`self-end ${errors?.mobileNumber && 'mb-5'}`} onClick={handleSearch}>
                            Search
                        </Button>
                    </div>
                    <CustomizedInputWithLabel
                        label="Agent Name"
                        placeholder="Agent Name"
                        {...register("collectorName")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Agent Type"
                        // list={collectorType}
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
