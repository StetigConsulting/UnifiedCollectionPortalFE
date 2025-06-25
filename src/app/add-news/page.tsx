'use client';

import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import CustomizedSelectInputWithLabel from '@/components/CustomizedSelectInputWithLabel';
import { Button } from '@/components/ui/button';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsNoticeSchema } from '@/lib/zod';
import { addNewsNotice, deleteNewsById, getAllNewsList } from '@/app/api-calls/other/api';
import { toast } from 'sonner';
import { formatDate, getErrorMessage } from '@/lib/utils';
import ReactTable from '@/components/ReactTable';
import SuccessErrorModal from "@/components/SuccessErrorModal";

type FormData = z.infer<typeof newsNoticeSchema>;

const NewsNoticeForm = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(newsNoticeSchema),
    });

    const [isLoading, setIsLoading] = React.useState(false);
    const [newsList, setNewsList] = React.useState<any[]>([]);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            let payload = {
                category: data?.category,
                title: data?.title,
                description: data?.description,
            }
            const response = await addNewsNotice(payload);
            // toast.success("News / Notice added successfully");
            setPopupType('success')
            setErrorMessage('News Created Successfully!')
            setIsErrorModalOpened(true)
            reset()
            getAllNewsForDiscom();
        } catch (error) {
            // toast.error('Error: ' + getErrorMessage(error));
            setErrorMessage('Error: ' + getErrorMessage(error))
            setPopupType('error')
            setIsErrorModalOpened(true)
        }
        finally {
            setIsLoading(false);
        }
    };

    const getAllNewsForDiscom = async () => {
        setIsLoading(true);
        try {
            const response = await getAllNewsList();
            setNewsList(response?.data || []);
        } catch (error) {
            console.error('Error: ' + getErrorMessage(error));
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getAllNewsForDiscom();
    }, [])

    const columns = useMemo(() => [
        { label: 'Category', key: 'category', sortable: true },
        { label: 'Title', key: 'title', sortable: true },
        { label: 'Description', key: 'description', sortable: true },
        {
            label: 'Date Published', key: 'published_date', sortable: true
        },
    ], []);

    const formatData = newsList.map((item) => ({
        ...item,
        category: item.category,
        title: item.title,
        description: item.description,
        published_date: formatDate(item?.published_date)
    }))

    const [selectedRow, setSelectedRow] = useState<any | null>(null);

    const handleRowSelection = (row: any) => {
        setSelectedRow(row)
    }

    const handleDeleteNews = async (id: string) => {
        setIsLoading(true);
        try {
            let payload = {
                id
            }

            const response = await deleteNewsById(payload);
            setSelectedRow(null)
            setPopupType('success')
            setErrorMessage('News Deleted Successfully!')
            setIsErrorModalOpened(true)
            getAllNewsForDiscom()
        } catch (error) {
            setErrorMessage('Error: Failed to delete record!')
            setPopupType('error')
            setIsErrorModalOpened(true)
        }
        finally {
            setIsLoading(false)
        }
    }

    const getSelectedRowButton = () => {
        return <div className="space-x-2">
            <Button variant="default" onClick={() => { handleDeleteNews(selectedRow?.id) }}>Delete</Button>
        </div>
    }

    const [isErrorModalOpened, setIsErrorModalOpened] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [popupType, setPopupType] = useState('success');

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
            <div className='mt-4'>
                <ReactTable
                    data={formatData}
                    columns={columns}
                    hideSearchAndOtherButtons
                    isSelectable={true}
                    onRowSelect={handleRowSelection}
                    onRowSelectButtons={
                        getSelectedRowButton()
                    }
                    selectedRow={selectedRow}
                />
            </div>
            <SuccessErrorModal isOpen={isErrorModalOpened} onClose={() => setIsErrorModalOpened(false)}
                message={errorMessage} type={popupType} />
        </AuthUserReusableCode>
    );
};

export default NewsNoticeForm;
