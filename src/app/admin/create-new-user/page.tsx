'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ReactTable from '@/components/ReactTable';
import { Button } from '@/components/ui/button';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { urlsListWithTitle } from '@/lib/utils';
import { getListOfAllUsers } from '@/app/api-calls/admin/api';


const CreateUserConfiguration = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);

    const columns = [
        { label: 'User ID', key: 'id', sortable: true },
        { label: 'User Role', key: 'role', sortable: true },
        { label: 'Name', key: 'name', sortable: true },
        { label: 'Mobile Number', key: 'mobile', sortable: true },
        { label: 'Created at', key: 'createdAt', sortable: true },
    ];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getListOfAllUsers();
            console.log('data', data.data);
            // setUsers(data?.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <AuthUserReusableCode pageTitle="Create New User" isLoading={isLoading}>

            <ReactTable
                data={users}
                columns={columns}
                customActionButton={<Button variant="default" size="lg"
                    onClick={() => router.push(urlsListWithTitle.createNewUserForm.url)}
                >
                    Create New User
                </Button>}
            />
        </AuthUserReusableCode >
    );
};

export default CreateUserConfiguration;
