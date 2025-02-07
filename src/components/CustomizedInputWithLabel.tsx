import React from 'react';

const CustomizedInputWithLabel = ({ label = '', errors = null, requiredText = '', required = false, containerClass = '', ...props }) => {

    return (
        <div className={`${containerClass}`}>
            {label && <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                {label}{required ? <span className="text-red-500 ml-1">* {requiredText}</span> : ''}
            </label>}
            <input
                type="text"
                className="border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm w-full focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 transition-all ease-in-out"
                {...props}
            />
            {errors && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
            )}
        </div>
    );
};

export default CustomizedInputWithLabel;
