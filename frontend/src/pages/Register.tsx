import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RegisterForm from '../components/auth/RegisterForm';
import { RegisterData } from '../types/auth.types';

const Register: React.FC = () => {
    const [error, setError] = useState<string>('');
    const { register, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/learn');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (data: RegisterData) => {
        setError('');
        try {
            await register(data);
        } catch (err: any) {
            console.error(err);
            // Handle specific error messages from backend
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex flex-grow justify-center items-center p-4">
                <RegisterForm 
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    error={error}
                />
            </div>
        </div>
    );
};

export default Register;
