import React, { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';

const DebugInfo = () => {
    const { user, loading } = useAuth();
    const [envCheck, setEnvCheck] = useState({});

    useEffect(() => {
        setEnvCheck({
            apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        });
        console.log("Debug Info Mounted");
    }, []);

    if (process.env.NODE_ENV === 'production') {
        // Only show if specifically enabled or we want to force it for debugging this issue
        // For now, let's show it as a small overlay
    }

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-white p-4 rounded text-xs font-mono max-w-sm overflow-auto max-h-screen">
            <h3 className="font-bold border-b border-gray-600 mb-2">Debug Overlay</h3>
            <div>
                <strong>Auth Loading:</strong> {loading ? 'YES' : 'NO'}
            </div>
            <div>
                <strong>User:</strong> {user ? user.email : 'NULL'}
            </div>
            <div className="mt-2">
                <strong>Config Check:</strong>
                <pre>{JSON.stringify(envCheck, null, 2)}</pre>
            </div>
            <div className="mt-2 text-[10px] text-gray-400">
                v{new Date().toISOString()}
            </div>
        </div>
    );
};

export default DebugInfo;
