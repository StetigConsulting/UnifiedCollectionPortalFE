import React from 'react';

type SelectOption = {
    [key: string]: any;
    id?: string | number;
    value: string | number;
    label: string;
};

type CustomizedSelectInputWithLabelProps = {
    label: string;
    errors?: any;
    required?: boolean;
    containerClass?: string;
    list: SelectOption[];
    placeholder?: string;
    removeDefaultOption?: boolean;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

const CustomizedSelectInputWithLabel: React.FC<CustomizedSelectInputWithLabelProps> = ({
    label,
    errors,
    required = false,
    containerClass = '',
    list = [],
    placeholder,
    removeDefaultOption,
    ...props
}) => {
    return (
        <div className={`flex flex-col ${containerClass}`}>
            <label htmlFor={props.id || 'select-input'} className="block text-sm font-medium text-gray-700 mb-1">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                {...props}
                id={props.id || 'select-input'}
                className="bg-white border border-gray-300 rounded-md shadow-sm w-full px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 transition-all ease-in-out"
            >
                {!removeDefaultOption && <option value="">{placeholder || 'Select an option'}</option>}
                {list.map((data) => (
                    <option key={data.id || data.value} value={data.value}>{data.label}</option>
                ))}
            </select>

            {errors && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
            )}
        </div>
    );
};

export default CustomizedSelectInputWithLabel;
