'use client'

import Image from 'next/image'
import React from 'react'
import { InfinitySpin } from 'react-loader-spinner'

function Loading() {
    return (
        <div className="h-screen">
            <div className='h-screen w-full flex items-center justify-center'>
                {/* <InfinitySpin
                    // visible={true}
                    width="200"
                    color="#18181b"
                // ariaLabel="infinity-spin-loading"
                /> */}
                <Image alt=""
                    width={150}
                    height={1000}
                    unoptimized
                    className="mx-auto object-contain"
                    src='/images/loader.gif' />
            </div>
        </div>
    )
}

export default Loading