// User.tsx (Server Component)
import React from 'react';
import { auth } from '@/app/auth';
import UserClient from './UserClient';

const User = async () => {
    const session = await auth();
    console.log(session);
    return <UserClient session={session} />;
};

export default User;
