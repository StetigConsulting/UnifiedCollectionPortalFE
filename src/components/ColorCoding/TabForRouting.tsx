import React from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'

const TabForRouting = ({ router }) => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col gap-4 items-center">
                <Button variant="default" className="w-full" onClick={() => router.push('/admin/color-coding/logic')}>
                    Bill Background Color Coding based on Last Payment Date
                </Button>
                <Button variant="default" className="w-full" onClick={() => router.push('/admin/color-coding/bill-basis')}>
                    Bill Font Color Coding based on Bill Basis
                </Button>
                <Button variant="default" className="w-full" onClick={() => router.push('/admin/color-coding/ecl-flag-customer')}>
                    Bill Background Color Coding based on ECL Flagged Customers
                </Button>
            </div>
        </div>

    )
}

export default TabForRouting