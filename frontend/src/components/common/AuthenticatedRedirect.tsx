import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from './Loading';

interface AuthenticatedRedirectProps {
  children: JSX.Element;
}

const AuthenticatedRedirect: React.FC<AuthenticatedRedirectProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
        return <Loading fullScreen />;
    }

    if (isAuthenticated) {
        return <Navigate to="/learn" replace />;
    }

    return children;
}

export default AuthenticatedRedirect;
