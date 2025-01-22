'use client'

import React from 'react'
import { InfinitySpin } from 'react-loader-spinner'

function Loading() {
    return (
        <div className="h-screen">
            <div className='h-screen w-full flex items-center justify-center'>
                <InfinitySpin
                    // visible={true}
                    width="200"
                    color="#18181b"
                // ariaLabel="infinity-spin-loading"
                />
            </div>
        </div>
    )
}

export default Loading