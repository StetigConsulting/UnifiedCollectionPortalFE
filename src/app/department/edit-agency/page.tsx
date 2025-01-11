'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editAgencySchema } from '@/lib/zod';
import { z } from 'zod';

type FormData = z.infer<typeof editAgencySchema>;

const EditAgency = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(editAgencySchema),
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
    };

    return (
        <AuthUserReusableCode pageTitle="Edit Agency">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Circle"
                        errors={errors.circle}
                        containerClass=""
                        placeholder="Select Circle Type"
                        list={[]}
                        {...register('circle')}
                    />
                    <CustomizedSelectInputWithLabel
                        label="Division"
                        errors={errors.division}
                        containerClass=""
                        placeholder="Select Division"
                        list={[]}
                        {...register('division')}
                    />
                    <CustomizedInputWithLabel
                        label="Agency Name"
                        errors={errors.agencyName}
                        containerClass="col-span-2"
                        placeholder="Select Agency Name"
                        {...register('agencyName')}
                    />
                    <CustomizedInputWithLabel
                        label="Agency ID"
                        errors={errors.agencyId}
                        containerClass=""
                        placeholder="Agency ID"
                        {...register('agencyId')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="New Agency Name"
                        errors={errors.newAgencyName}
                        containerClass=""
                        placeholder="Enter New Agency Name"
                        {...register('newAgencyName')}
                        disabled
                    />
                    <CustomizedInputWithLabel
                        label="Maximum Amount"
                        errors={errors.maximumAmount}
                        containerClass=""
                        placeholder="Enter Maximum Amount"
                        {...register('maximumAmount')}
                    />
                    <CustomizedInputWithLabel
                        label="Maximum Agent"
                        errors={errors.maximumAgent}
                        containerClass=""
                        placeholder="Enter Maximum Agent"
                        {...register('maximumAgent')}
                    />
                    <CustomizedInputWithLabel
                        label="Address"
                        errors={errors.address}
                        containerClass="col-span-2"
                        placeholder="Enter New Address"
                        {...register('address')}
                    />
                    <div className="grid grid-cols-3 gap-4 col-span-2">
                        <CustomizedInputWithLabel
                            label="WO Number"
                            errors={errors.woNumber}
                            containerClass=""
                            placeholder="Enter WO Number"
                            {...register('woNumber')}
                        />
                        <CustomizedInputWithLabel
                            label="Contact Person"
                            errors={errors.contactPerson}
                            containerClass=""
                            placeholder="Enter Contact Person"
                            {...register('contactPerson')}
                        />
                        <CustomizedInputWithLabel
                            label="Phone Number"
                            errors={errors.phoneNumber}
                            containerClass=""
                            placeholder="Enter Phone Number"
                            {...register('phoneNumber')}
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit" variant="default">
                        Submit
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default EditAgency;
