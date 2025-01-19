import React from 'react';

interface CheckboxOption {
    label: string;
    value: string;
}

interface CustomizedCheckboxGroupWithLabelProps {
    label: string;
    options: CheckboxOption[];
    errors?: { message?: string } | null;
    required?: boolean;
    containerClass?: string;
    register: any; // Pass the `register` function from `react-hook-form`
}

const CustomizedCheckboxGroupWithLabel: React.FC<CustomizedCheckboxGroupWithLabelProps> = ({
    label,
    options,
    errors = null,
    required = false,
    containerClass = '',
    register,
}) => {
    return (
        <div className={containerClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex flex-wrap space-x-4">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center">
                        <input
                            type="checkbox"
                            id={`checkbox-${option.value}`}
                            value={option.value}
                            {...register}
                            className="mr-2"
                        />
                        <label htmlFor={`checkbox-${option.value}`}>{option.label}</label>
                    </div>
                ))}
            </div>
            {errors && <p className="text-red-500 text-sm">{errors.message}</p>}
        </div>
    );
};

export default CustomizedCheckboxGroupWithLabel;
