import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';

const AuthGuard = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Debug log to confirm it's running and has context
    // console.log("AuthGuard: rendering", { user, loading }); 

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground animate-pulse">Loading Application...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthGuard;
