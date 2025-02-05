import React from 'react'
import { Button } from '../ui/button'

const TabForRouting = ({ router }) => {
    return (
        <div className="grid grid-cols-3 gap-4 mb-4">
            <Button variant="default" size="lg" className="w-full" onClick={() => router.push('/admin/color-coding/logic')}>
                Color Coding Logic
            </Button>
            <Button variant="default" size="lg" className="w-full" onClick={() => router.push('/admin/color-coding/bill-basis')}>
                Bill basis
            </Button>
            <Button variant="default" size="lg" className="w-full" onClick={() => router.push('/admin/color-coding/ecl-flag-customer')}>
                ECL Flagged Customer
            </Button>
        </div>
    )
}

export default TabForRouting