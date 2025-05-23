'use client'

import AuthUserReusableCode from '@/components/AuthUserReusableCode'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { getNewsNoticesForUser } from '../api-calls/other/api'

const AdminNewsNotices = () => {

    const { data: session } = useSession()

    const [newsList, setNewsList] = React.useState([])

    const fetchNewsNotices = async () => {
        try {
            const response = await getNewsNoticesForUser()
            setNewsList(response?.data)
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

            <Card className="max-w-xl mx-auto">
                <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">News / Notices :</h3>
                    {
                        newsList.length === 0 ? <ul className="list-disc list-inside space-y-1">{
                            newsList?.map((item: any, index: number) => (
                                <li key={index}><strong>{item?.title}</strong>: {item?.description}</li>
                            ))}
                        </ul> : <p>No news or notices available.</p>
                    }
                </CardContent>
            </Card>
        </AuthUserReusableCode>
    )
}

export default AdminNewsNotices