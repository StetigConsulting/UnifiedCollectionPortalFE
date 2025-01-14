import React from 'react'

const CustomizedSelectInputWithLabel = ({ label, errors, containerClass = '', list, ...props }) => {
    return (
        <div className={containerClass}>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <select {...props} id="designation" className="border rounded w-full" style={{ padding: '10px' }}>
                <option value="">{props.placeholder}</option>
                {list.map(data => (
                    <option key={data.id} value={data.designation}>{data.designation}</option>
                ))}
            </select>

            {errors && (
                <p className="text-red-500">{errors.message}</p>
            )}
        </div>
    )
}

export default CustomizedSelectInputWithLabel