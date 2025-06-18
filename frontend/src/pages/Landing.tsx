import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LandingIllustration from '../assets/Translate 1.svg';
import Loading from '../components/common/Loading';

const Landing: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Don't redirect while loading, wait for auth status to be confirmed
        if (!isLoading && isAuthenticated) {
            navigate('/learn');
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Don't render the page for authenticated users to avoid flash of content
    if (isLoading || isAuthenticated) {
        return <Loading fullScreen />;
    }

    return (
        <div className="flex min-h-screen bg-base-100">
            <div className="flex flex-col md:flex-row justify-center items-center px-4 gap-8 max-w-6xl mx-auto">
                <div className="w-full max-w-70 md:w-1/2 md:max-w-100 flex justify-center">
                    <img
                        src={LandingIllustration}
                        alt="Language learning illustration"
                        className="w-full max-w-md"
                    />
                </div>
                <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-base-content mb-8">
                        The free, fun, and effective way to learn a language!
                    </h1>
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <Link to="/register" className="btn btn-primary w-full uppercase">Get Started</Link>
                        <Link to="/login" className="btn btn-outline w-full text-secondary uppercase">I Already Have an Account</Link>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Landing;
