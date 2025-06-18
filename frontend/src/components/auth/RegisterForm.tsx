import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../common/FormInput';
import { validateRegisterForm } from '../../utils/validators';
import { RegisterData } from '../../types/auth.types';

interface RegisterFormProps {
    onSubmit: (data: RegisterData) => Promise<void>;
    isLoading: boolean;
    error: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading, error }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validation = validateRegisterForm(
            formData.firstName,
            formData.lastName,
            formData.email,
            formData.password,
            formData.confirmPassword
        );
        
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return;
        }
        
        setValidationErrors({});
        await onSubmit({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            password: formData.password
        });
    };

    return (
        <div className="w-full max-w-sm flex flex-col items-center gap-3">
            <h1 className="text-2xl font-bold text-base-content">Create your profile</h1>

            <form className="w-full flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
                <FormInput
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={validationErrors.firstName}
                    required
                    disabled={isLoading}
                />

                <FormInput
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={validationErrors.lastName}
                    required
                    disabled={isLoading}
                />

                <FormInput
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    error={validationErrors.email}
                    required
                    disabled={isLoading}
                />

                <FormInput
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    error={validationErrors.password}
                    required
                    disabled={isLoading}
                />

                <FormInput
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={validationErrors.confirmPassword}
                    required
                    disabled={isLoading}
                />

                {error && <div className="text-error text-sm text-center">{error}</div>}

                <button 
                    type="submit" 
                    className="btn btn-primary w-full" 
                    disabled={isLoading}
                >
                    {isLoading ? <span className="loading loading-spinner"></span> : "CREATE ACCOUNT"}
                </button>
            </form>

            <div className="text-center text-sm mt-4">
                Already have an account?{' '}
                <Link to="/login" className="link link-primary">
                    Log in
                </Link>
            </div>
        </div>
    );
};

export default RegisterForm;
