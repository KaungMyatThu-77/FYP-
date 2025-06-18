import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import { LoginCredentials } from '../types/auth.types';

const Login: React.FC = () => {
    const [error, setError] = useState<string>('');
    const { login, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/learn');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (credentials: LoginCredentials) => {
        setError('');
        try {
            await login(credentials);
        } catch (err: any) {
            console.error(err);
            // Handle specific error messages from backend
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Invalid email or password. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex flex-grow justify-center items-center p-4">
                <LoginForm 
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    error={error}
                />
            </div>
        </div>
    );
};

export default Login;
