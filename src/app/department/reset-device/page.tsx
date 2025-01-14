'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { resetDeviceSchema } from "@/lib/zod";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { z } from "zod";

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
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(resetDeviceSchema),
        defaultValues: {
            mobileNumber: "",
            collectorName: "",
            currentDevice: "Collector",
            agencyName: "",
            collectorType: "",
            reason: "",
        },
    });

    const onSubmit = (data: FormData) => {
        console.log("Resetting device with data:", data);
    };

    const handleSearch = () => {
        setValue("collectorName", "Bishnu Charan Pujari");
        setValue("agencyName", "Agency Name");
        console.log("Search executed");
    };

    return (
        <AuthUserReusableCode pageTitle="Reset Device (Collector)">
            <form className="space-y-4 p-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedInputWithLabel
                        label="Collector Mobile Number"
                        containerClass=""
                        placeholder="Enter Mobile Number"
                        {...register("mobileNumber")}
                        errors={errors.mobileNumber}
                    />
                    <Button type="button" variant="default" className="self-end" onClick={handleSearch}>
                        Search
                    </Button>
                    <CustomizedInputWithLabel
                        label="Collector Name"
                        placeholder="Collector Name"
                        containerClass=""
                        {...register("collectorName")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        containerClass=""
                        label="Current Device"
                        placeholder="Current Device"
                        {...register("currentDevice")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        containerClass=""
                        label="Agency Name"
                        placeholder="Agency Name"
                        {...register("agencyName")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Collector Type"
                        containerClass=""
                        placeholder="Collector Type"
                        {...register("collectorType")}
                        errors={errors.collectorType}
                    />
                </div>
                <CustomizedInputWithLabel
                    label="Reason"
                    containerClass=""
                    placeholder="Enter Reason"
                    {...register("reason")}
                    errors={errors.reason}
                />
                <div className="flex justify-end">
                    <Button type="submit" variant="default">
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
                                <TableHead>Mobile Number</TableHead>
                                <TableHead>Collector Name</TableHead>
                                <TableHead>Collector ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Synced Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockRegisteredDeviceData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.mobileNumber}</TableCell>
                                    <TableCell>{item.collectorName}</TableCell>
                                    <TableCell>{item.collectorId}</TableCell>
                                    <TableCell>{item.status}</TableCell>
                                    <TableCell>{item.lastSyncedDate}</TableCell>
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
