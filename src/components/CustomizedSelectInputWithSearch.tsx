import React, { useState, useRef, useEffect } from "react";
import CustomizedInputWithLabel from './CustomizedInputWithLabel';

export type SelectOption = {
    [key: string]: any;
    id?: string | number;
    value: string | number;
    label: string;
};

export type CustomizedSelectInputWithSearchProps = {
    label: string;
    errors?: any;
    required?: boolean;
    containerClass?: string;
    list: SelectOption[];
    placeholder?: string;
    removeDefaultOption?: boolean;
    hideLabel?: boolean;
    value?: string | number;
    onChange?: (selectedValue: string | number) => void;
    disabled?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'value'>;

const CustomizedSelectInputWithSearch: React.FC<CustomizedSelectInputWithSearchProps> = ({
    label,
    errors,
    required = false,
    containerClass = '',
    list = [],
    placeholder,
    removeDefaultOption,
    hideLabel = false,
    value,
    onChange,
    disabled = false,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedValue, setSelectedValue] = useState<string | number | undefined>(value as string | number | undefined);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSelectedValue(value as string | number | undefined);
        // If value changes externally, update search to match label
        const selectedOption = list.find((o) => o.value === value);
        setSearch(selectedOption ? selectedOption.label : '');
    }, [value, list]);

    // Open dropdown when input is focused or typed in
    const handleInputFocus = () => {
        if (!disabled) setIsOpen(true);
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setIsOpen(true);
    };

    // Filter options by label
    const filteredList = list.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
    );

    // Select an option
    const handleOptionClick = (optionValue: string | number, optionLabel: string) => {
        setSelectedValue(optionValue);
        setSearch(optionLabel);
        setIsOpen(false);
        if (onChange) onChange(optionValue);
    };

    // Clear selection
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedValue(undefined);
        setSearch('');
        if (onChange) onChange("");
        setIsOpen(false);
        inputRef.current?.focus();
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Keyboard navigation (optional: basic support)
    // You can add arrow key navigation if needed

    return (
        <div className={`relative flex flex-col ${containerClass}`} ref={dropdownRef} title={props.title}>
            {hideLabel ? null : (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative w-full">
                <CustomizedInputWithLabel
                    label=""
                    value={search}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder || 'Select an option'}
                    disabled={disabled}
                    inputref={inputRef}
                    containerClass="mb-0"
                    autoComplete="off"
                />
                {search && !disabled && (
                    <button
                        type="button"
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none"
                        onClick={handleClear}
                        aria-label="Clear selection"
                        tabIndex={-1}
                    >
                        &times;
                    </button>
                )}
            </div>
            {isOpen && (
                <div
                    className="absolute z-[9999] bg-white border rounded-md top-16 shadow-lg w-full min-w-[300px] max-h-60 overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {filteredList.length > 0 ? (
                        filteredList.map((option, idx) => (
                            <div
                                key={option.id || option.value + '_' + idx}
                                onClick={() => handleOptionClick(option.value, option.label)}
                                className={`p-2 hover:bg-blue-50 cursor-pointer ${selectedValue === option.value ? "bg-blue-100" : ""} whitespace-nowrap overflow-hidden text-ellipsis`}
                                role="option"
                                aria-selected={selectedValue === option.value}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-gray-400 text-sm">No options found</div>
                    )}
                </div>
            )}
            {errors && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
            )}
        </div>
    );
};

export default CustomizedSelectInputWithSearch; 