'use client'

import AuthUserReusableCode from '@/components/AuthUserReusableCode'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { getNewsNoticesForUser } from '../api-calls/other/api'

const AdminNewsNotices = () => {

    const { data: session } = useSession()

    const fetchNewsNotices = async () => {
        try {
            const response = await getNewsNoticesForUser()
            console.log('News / Notices:', response)
        } catch (error) {
            console.error('Error fetching news/notices:', error)
        }
    }

    useEffect(() => {
        fetchNewsNotices()
    }, [])

    return (
        <AuthUserReusableCode pageTitle='News / Notice'>
            <div className='p-4'>
                <img alt="" src="/images/logo.png" width={200} className='m-auto mb-4' />
            </div>
            <div className="text-center text-2xl font-semibold mb-6">
                Welcome, {session?.user?.userName}
            </div>

            {/* News / Notices */}
            <Card className="max-w-xl mx-auto">
                <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">News / Notices :</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>New Agent: Agent XYZ assigned to Area1!</li>
                        <li>New Agent: Agent XYZ assigned to Area2!</li>
                    </ul>
                </CardContent>
            </Card>
        </AuthUserReusableCode>
    )
}

export default AdminNewsNotices