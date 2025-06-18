import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../common/FormInput';
import { validateLoginForm } from '../../utils/validators';
import { LoginCredentials } from '../../types/auth.types';

interface LoginFormProps {
    onSubmit: (credentials: LoginCredentials) => Promise<void>;
    isLoading: boolean;
    error: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        
        const validation = validateLoginForm(formData.email, formData.password);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return;
        }
        
        setValidationErrors({});
        await onSubmit(formData);
    };

    return (
        <div className="w-full max-w-sm flex flex-col items-center gap-3">
            <h1 className="text-2xl font-bold text-base-content">Log in</h1>

            <form className="w-full flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
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

                {error && <div className="text-error text-sm text-center">{error}</div>}

                <button 
                    type="submit" 
                    className="btn btn-primary w-full" 
                    disabled={isLoading}
                >
                    {isLoading ? <span className="loading loading-spinner"></span> : "LOG IN"}
                </button>
            </form>

            <div className="divider">OR</div>

            <div className="grid grid-cols-2 gap-x-4 w-full">
                <button className="btn btn-disabled w-full">
                    FACEBOOK
                </button>
                <button className="btn btn-disabled w-full">
                    GOOGLE
                </button>
            </div>

            <div className="text-center text-sm mt-4">
                Don't have an account?{' '}
                <Link to="/register" className="link link-primary">
                    Sign up
                </Link>
            </div>
        </div>
    );
};

export default LoginForm;
