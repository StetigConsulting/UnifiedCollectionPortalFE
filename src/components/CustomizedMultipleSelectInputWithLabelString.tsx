import React, { useState, useEffect, useRef } from "react";

interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    label: string;
    list: Option[];
    value?: string[];
    placeholder?: string;
    required?: boolean;
    multi?: boolean;
    containerClass?: string;
    errors?: { message?: string };
    onChange: (selectedValue: string[]) => void;
    disabled?: boolean;
}

const CustomizedMultipleSelectInputWithLabelString: React.FC<SelectProps> = ({
    label,
    list,
    value = [],
    placeholder = "Select an option",
    required = false,
    multi = false,
    containerClass = "",
    errors,
    onChange,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState<string[]>(value);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    const handleOptionClick = (optionValue: string) => {
        if (multi) {
            const newSelectedValues = selectedValues.includes(optionValue)
                ? selectedValues.filter((v) => v !== optionValue)
                : [...selectedValues, optionValue];

            setSelectedValues(newSelectedValues);
            onChange(newSelectedValues);
        } else {
            const newSelectedValues = [optionValue];
            setSelectedValues(newSelectedValues);
            onChange(newSelectedValues);
            setIsOpen(false);
        }
    };

    const handleOutsideClick = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        if (Array.isArray(value)) {
            setSelectedValues(value);
        }
    }, [value]);

    const handleRemoveSelectedValue = (optionValue: string) => {
        const newSelectedValues = selectedValues.filter((value) => value !== optionValue);
        setSelectedValues(newSelectedValues);
        onChange(newSelectedValues);
    };

    return (
        <div className={`relative ${containerClass}`} ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                className={`border rounded-md w-full ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-pointer"}`}
                style={{ padding: '8px' }}
                onClick={toggleDropdown}
            >
                {selectedValues.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedValues.map((selectedValue, i) => {
                            const selectedOption = list?.find((o) => o.value === selectedValue);
                            return (
                                <span
                                    key={selectedValue}
                                    className={`rounded-full text-sm bg-blue-100 px-2 py-1`}
                                >
                                    {selectedOption?.label}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSelectedValue(selectedValue)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        &times;
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                ) : (
                    <span className="text-gray-500 text-sm">{placeholder}</span>
                )}
            </div>

            {isOpen && (
                <div
                    className="absolute z-10 bg-white border rounded-md mt-2 shadow-lg w-full max-h-48 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {list?.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleOptionClick(option.value)}
                            className={`p-2 hover:bg-blue-50 cursor-pointer ${selectedValues.includes(option.value) ? "bg-blue-100" : ""
                                }`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}

            {errors?.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
        </div>
    );
};

export default CustomizedMultipleSelectInputWithLabelString;
