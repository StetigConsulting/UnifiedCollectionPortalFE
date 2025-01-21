import React, { useState, useEffect, useRef } from "react";

interface Option {
    value: number;
    label: string;
}

interface SelectProps {
    label: string;
    list: Option[];
    value?: number[];
    placeholder?: string;
    required?: boolean;
    multi?: boolean;
    containerClass?: string;
    errors?: { message?: string };
    onChange: (selectedValue: number[]) => void;
}

const CustomizedMultipleSelectInputWithLabelNumber: React.FC<SelectProps> = ({
    label,
    list,
    value = [],
    placeholder = "Select an option",
    required = false,
    multi = false,
    containerClass = "",
    errors,
    onChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState<number[]>(value);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    const handleOptionClick = (optionValue: number) => {
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

    return (
        <div className={`relative ${containerClass}`} ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                className="border rounded-md w-full p-2 bg-white cursor-pointer"
                onClick={toggleDropdown}
            >
                {selectedValues.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedValues.map((selectedValue) => {
                            const selectedOption = list?.find((o) => o.value === selectedValue);
                            return (
                                <span
                                    key={selectedValue}
                                    className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm"
                                >
                                    {selectedOption?.label}
                                </span>
                            );
                        })}
                    </div>
                ) : (
                    <span className="text-gray-500">{placeholder}</span>
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

            {errors?.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
        </div>
    );
};

export default CustomizedMultipleSelectInputWithLabelNumber;
