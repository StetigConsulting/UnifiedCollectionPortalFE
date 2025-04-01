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
import { getRegisteredDevices } from "@/app/api-calls/agency/api";
import { getAgentByPhoneNumber } from "@/app/api-calls/department/api";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

type FormData = z.infer<typeof resetDeviceSchema>;

const mockRegisteredDeviceData = [
    {
        mobileNumber: "7738414900",
        collectorName: "Satyam Aryaan Kumar",
        collectorId: "2001100110029",
        status: "Active",
        lastSyncedDate: "06-01-2024",
    },
];

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

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
        resolver: zodResolver(resetDeviceSchema),
        defaultValues: {
            mobileNumber: "",
            collectorName: "",
            agencyName: "",
            collectorType: null,
        },
    });

    const onSubmit = (data: FormData) => {
        console.log("Resetting device with data:", data);
    };

    const formData = watch()

    const [collectorType, setCollectorType] = useState([])
    const [deviceData, setDeviceData] = useState([])

    const handleSearch = async () => {
        try {
            const mobileNumber = Number(formData?.mobileNumber)
            const response = await getAgentByPhoneNumber(mobileNumber)
            setValue("collectorName", response?.data?.agent_name);
            setValue("agencyName", response?.data?.agent_name);
            setCollectorType([{ id: response?.data?.collector_type?.id, label: response?.data?.collector_type?.name }]);
            const registeredResponse = await getRegisteredDevices(response?.data?.id);
            let arrData = [];
            arrData.push(registeredResponse.data)
            setDeviceData(arrData || [])
            setValue('collectorType', response?.data?.collector_type?.id);
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error))
            setValue("collectorName", '');
            setValue("agencyName", '');
            setValue('collectorType', null);
        }
    };

    console.log(collectorType)

    return (
        <AuthUserReusableCode pageTitle="Reset Device (Collector)">
            <form className="space-y-4 p-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Collector Mobile Number"
                        placeholder="Enter Mobile Number"
                        {...register("mobileNumber")}
                        errors={errors.mobileNumber}
                    />
                    <Button type="button" variant="default" className={`self-end ${errors?.mobileNumber && 'mb-5'}`} onClick={handleSearch}>
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

                    <Button type="submit" variant="default" className={`self-end`}>
                        Reset
                    </Button>
                </div>

            </form>

            <div className="p-4">
                <h2 className="text-lg font-bold">Registered Mobile Number With This Device</h2>
                <div className="overflow-x-auto mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Collector Name</TableHead>
                                <TableHead>Mobile Number</TableHead>
                                <TableHead>Device ID</TableHead>
                                <TableHead>Device Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>App Version</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deviceData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.user_name}</TableCell>
                                    <TableCell>{item.mobile_number}</TableCell>
                                    <TableCell>{item.device_id}</TableCell>
                                    <TableCell>{item.device_name}</TableCell>
                                    <TableCell>{item.is_device_active ? 'Active' : 'Inactive'}</TableCell>
                                    <TableCell>{item.app_version}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <h2 className="text-lg font-bold mt-8">Previous Mobile History Reset Data</h2>
                <div className="overflow-x-auto mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User Name</TableHead>
                                <TableHead>Collector Name</TableHead>
                                <TableHead>Mobile Number</TableHead>
                                <TableHead>Device Info</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPreviousHistoryData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.userName}</TableCell>
                                    <TableCell>{item.collectorName}</TableCell>
                                    <TableCell>{item.mobileNumber}</TableCell>
                                    <TableCell>{item.deviceInfo}</TableCell>
                                    <TableCell>{item.reason}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default ResetDeviceCollector;
