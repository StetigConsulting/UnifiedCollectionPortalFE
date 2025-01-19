import React from 'react'

const CustomizedInputWithLabel = ({ label, errors = null, required = false, containerClass = '', ...props }) => {
    return (
        <div className={containerClass}>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                {label}{required ? <span className="text-red-500">*</span> : ''}
            </label>
            <input
                type="text"
                className="border rounded p-2 w-full"
                {...props}
            />
            {errors && (
                <p className="text-red-500">{errors.message}</p>
            )}
        </div>
    )
}

export default CustomizedInputWithLabel