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

type FormData = z.infer<typeof newsNoticeSchema>;

const NewsNoticeForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(newsNoticeSchema),
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
    };

    return (
        <AuthUserReusableCode pageTitle="News / Notice">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <CustomizedSelectInputWithLabel
                        label="Category"
                        placeholder="Select Category"
                        list={[]}
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
