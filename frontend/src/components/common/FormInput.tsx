import React from 'react';

interface FormInputProps {
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    name?: string;
}

const FormInput: React.FC<FormInputProps> = ({
    type,
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    name
}) => {
    return (
        <div className="w-full">
            <input
                type={type}
                placeholder={placeholder}
                className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                name={name}
            />
            {error && (
                <div className="text-error text-sm mt-1">{error}</div>
            )}
        </div>
    );
};

export default FormInput;
