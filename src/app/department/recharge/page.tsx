'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import React from 'react';

const Recharge = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data: any) => {
        console.log(data);
    };

    return (
        <AuthUserReusableCode pageTitle="Recharge">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Select Agency"
                        errors={errors.agency}
                        containerClass=""
                        placeholder="Select Agency"
                        list={[]}
                        {...register("agency")}
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        errors={errors.agencyName}
                        containerClass=""
                        placeholder="Agency Name"
                        {...register("agencyName")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Agency ID"
                        errors={errors.agencyId}
                        containerClass=""
                        placeholder="Agency ID"
                        {...register("agencyId")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Phone Number"
                        errors={errors.phoneNumber}
                        containerClass=""
                        placeholder="Phone Number"
                        {...register("phoneNumber")}
                        disabled
                    />
                    <CustomizedSelectInputWithLabel
                        label="Transaction Type"
                        errors={errors.transactionType}
                        containerClass="col-span-2"
                        placeholder="Recharge"
                        list={[]}
                        {...register("transactionType")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Amount"
                        errors={errors.amount}
                        containerClass=""
                        placeholder="Enter Amount"
                        {...register("amount")}
                    />
                    <CustomizedInputWithLabel
                        label="Current Balance"
                        errors={errors.currentBalance}
                        containerClass=""
                        placeholder="Current Balance"
                        {...register("currentBalance")}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Remark"
                        errors={errors.remark}
                        containerClass="col-span-2"
                        placeholder="Any Remark"
                        {...register("remark")}
                    />
                </div>

                <div className="flex justify-end mt-4">

                </div>

                <div className="mt-4 p-4 border rounded-md flex">
                    <div className='flex-1'>
                        <p>Recharge Amount: 3000</p>
                        <p>Current Balance: 3000</p>
                    </div>
                    <div className='self-center'>
                        <Button type="submit" variant="default">
                            Submit
                        </Button>
                    </div>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default Recharge;
