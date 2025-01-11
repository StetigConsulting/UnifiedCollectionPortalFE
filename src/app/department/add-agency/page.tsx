'use client'

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import { addAgencySchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type FormData = z.infer<typeof addAgencySchema>;

const AddAgency = () => {

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(addAgencySchema),
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
    };

    return (
        <AuthUserReusableCode pageTitle='Add Agency'>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        containerClass=''
                        label="User Type"
                        errors={errors.userType}
                        placeholder="Select User Type"
                        list={[]}
                        {...register("userType")}
                    />
                    <CustomizedInputWithLabel
                        containerClass=''
                        label="Agency Name"
                        errors={errors.agencyName}
                        placeholder="Enter Agency Name"
                        {...register("agencyName")}
                    />
                    <CustomizedInputWithLabel
                        containerClass='col-span-2'
                        label="Vendor ID"
                        errors={errors.vendorId}
                        placeholder="Enter Vendor ID"
                        {...register("vendorId")}
                    />
                    <CustomizedInputWithLabel
                        containerClass='col-span-2'
                        label="Registered Address"
                        errors={errors.registeredAddress}
                        placeholder="Enter Registered Address"
                        {...register("registeredAddress")}
                    />
                    <CustomizedInputWithLabel
                        containerClass=''
                        label="WO Number"
                        errors={errors.woNumber}
                        placeholder="Enter WO Number"
                        {...register("woNumber")}
                    />
                    <CustomizedInputWithLabel
                        containerClass=''
                        label="Email"
                        errors={errors.email}
                        placeholder="Enter Email Address"
                        {...register("email")}
                    />
                    <CustomizedInputWithLabel
                        containerClass=''
                        label="Contact Person"
                        errors={errors.contactPerson}
                        placeholder="Enter Contact Person"
                        {...register("contactPerson")}
                    />
                    <CustomizedInputWithLabel
                        containerClass=''
                        label="Phone Number"
                        errors={errors.phoneNumber}
                        placeholder="Enter Phone Number"
                        {...register("phoneNumber")}
                    />
                    <CustomizedInputWithLabel
                        label="Maximum Limit"
                        errors={errors.maximumLimit}
                        containerClass=""
                        placeholder="Enter Maximum Limit"
                        {...register("maximumLimit")}
                    />
                    <CustomizedInputWithLabel
                        label="Maximum Agent"
                        errors={errors.maximumAgent}
                        containerClass=""
                        placeholder="Enter Maximum Agent"
                        {...register("maximumAgent")}
                    />
                    <div className="grid grid-cols-3 gap-4 col-span-2">
                        <CustomizedInputWithLabel
                            label="Validity Date"
                            errors={errors.validityDate}
                            containerClass=""
                            placeholder="Choose Validity Date"
                            type="date"
                            {...register("validityDate")}
                        />
                        <CustomizedInputWithLabel
                            label="Payment Date"
                            errors={errors.paymentDate}
                            containerClass=""
                            placeholder="Choose Payment Date"
                            type="date"
                            {...register("paymentDate")}
                        />
                        <CustomizedInputWithLabel
                            label="Transaction ID"
                            errors={errors.transactionId}
                            containerClass=""
                            placeholder="Enter Transaction ID"
                            {...register("transactionId")}
                        />
                        <CustomizedInputWithLabel
                            label="Initial Balance"
                            errors={errors.initialBalance}
                            containerClass=""
                            placeholder="Enter Initial Balance"
                            {...register("initialBalance")}
                        />
                        <CustomizedSelectInputWithLabel
                            label="Payment Mode"
                            errors={errors.paymentMode}
                            containerClass=""
                            list={[]}
                            placeholder="Select Payment Mode"
                            {...register("paymentMode")}
                        />
                        <CustomizedInputWithLabel
                            label="Payment Remark"
                            errors={errors.paymentRemark}
                            containerClass=""
                            placeholder="Enter Payment Remark"
                            {...register("paymentRemark")}
                        />
                    </div>
                    <CustomizedSelectInputWithLabel
                        label="Circle"
                        errors={errors.circle}
                        containerClass=""
                        placeholder="Select Circle Type"
                        list={[]}
                        {...register("circle")}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Division"
                        errors={errors.division}
                        containerClass=""
                        placeholder="Select Division"
                        list={[]}
                        {...register("division")}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Sub Division"
                        errors={errors.subDivision}
                        containerClass="col-span-2"
                        placeholder="Select Sub Division"
                        list={[]}
                        {...register("subDivision")}
                    />
                    <CustomizedInputWithLabel
                        label="Permissions"
                        errors={errors.permission}
                        containerClass=""
                        placeholder="Select Permissions"
                        {...register("permission")}
                    />
                    <CustomizedInputWithLabel
                        label="Collection Type"
                        errors={errors.collectionType}
                        containerClass=""
                        placeholder="Select Collection Type"
                        {...register("collectionType")}
                    />
                    <CustomizedInputWithLabel
                        label="Non Energy"
                        errors={errors.nonEnergy}
                        containerClass=""
                        placeholder="Select Non Energy"
                        {...register("nonEnergy")}
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit" variant="default">
                        Submit
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode >
    )
}

export default AddAgency