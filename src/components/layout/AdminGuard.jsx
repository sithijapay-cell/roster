import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { isAdmin } from '../../config/admin';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ShieldAlert, Lock } from 'lucide-react';

const ADMIN_PIN = '123456';

const AdminGuard = ({ children }) => {
    const { user, loading } = useAuth();
    const [pinVerified, setPinVerified] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState(false);
    const [shake, setShake] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    // UID Gate — invisible redirect
    if (!user || !isAdmin(user)) {
        return <Navigate to="/" replace />;
    }

    // PIN Gate
    if (!pinVerified) {
        const handlePinSubmit = (e) => {
            e.preventDefault();
            if (pin === ADMIN_PIN) {
                setPinVerified(true);
                setPinError(false);
            } else {
                setPinError(true);
                setShake(true);
                setPin('');
                setTimeout(() => setShake(false), 500);
            }
        };

        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className={`w-full max-w-sm space-y-6 ${shake ? 'animate-shake' : ''}`}>
                    <div className="text-center space-y-3">
                        <div className="inline-flex p-4 rounded-2xl bg-primary/10 mx-auto">
                            <ShieldAlert className="w-12 h-12 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
                        <p className="text-sm text-muted-foreground">Enter 6-digit security PIN to continue</p>
                    </div>

                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="password"
                                maxLength={6}
                                placeholder="● ● ● ● ● ●"
                                value={pin}
                                onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setPinError(false); }}
                                className="pl-10 text-center text-2xl tracking-[0.5em] font-mono h-14"
                                inputMode="numeric"
                                autoFocus
                            />
                        </div>

                        {pinError && (
                            <p className="text-destructive text-sm text-center font-medium">
                                Invalid PIN. Access denied.
                            </p>
                        )}

                        <Button type="submit" className="w-full h-12 text-base font-bold" disabled={pin.length < 6}>
                            Verify Access
                        </Button>
                    </form>

                    <p className="text-xs text-center text-muted-foreground/50">
                        Session expires on page refresh
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminGuard;
