'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsNoticeSchema } from '@/lib/zod';
import { addNewsNotice } from '@/app/api-calls/other/api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

type FormData = z.infer<typeof newsNoticeSchema>;

const NewsNoticeForm = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(newsNoticeSchema),
    });

    const [isLoading, setIsLoading] = React.useState(false);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);

        try {
            let payload = {
                category: data?.category,
                title: data?.title,
                description: data?.description,
            }
            const response = await addNewsNotice(payload);
            toast.success("News / Notice added successfully");
            reset()
            console.log("response", response);
        } catch (error) {
            toast.error('Error: ' + getErrorMessage(error));
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthUserReusableCode pageTitle="News / Notice" isLoading={isLoading}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Category"
                        placeholder="Select Category"
                        list={[
                            { label: 'Agency', value: 'agency' },
                            { label: 'Agent', value: 'agent' },
                        ]}
                        errors={errors.category}
                        {...register('category')}
                    />
                    <CustomizedInputWithLabel
                        label="Title"
                        placeholder="Enter Title"
                        errors={errors.title}
                        {...register('title')}
                    />
                </div>

                <div className="col-span-2">
                    <CustomizedInputWithLabel
                        label="Description"
                        placeholder="Enter Description"
                        errors={errors.description}
                        containerClass="col-span-2"
                        type="textarea"
                        {...register('description')}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" variant="default" className="h-10 px-8">
                        Submit
                    </Button>
                </div>
            </form>
        </AuthUserReusableCode>
    );
};

export default NewsNoticeForm;
