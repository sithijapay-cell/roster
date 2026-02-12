import React from 'react';
import ProfileForm from '../components/ProfileForm';
import { useStore } from '../../../context/StoreContext';
import { Button } from '../../../components/ui/Button';
import { LogIn, LogOut, Cloud } from 'lucide-react';

const ProfilePage = () => {
    const { user, loginWithGoogle, logout, loading } = useStore();

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-blue-500" />
                        Account & Sync
                    </h2>
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
                            <Button onClick={logout} variant="outline" size="sm" className="gap-2">
                                <LogOut size={16} /> Logout
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={loginWithGoogle} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <LogIn size={16} /> Login with Google
                        </Button>
                    )}
                </div>
                {!user && (
                    <p className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 dark:text-yellow-400 p-3 rounded-md">
                        ⚠️ You are using local storage. Login to sync your roster across devices and prevent data loss.
                    </p>
                )}
                {user && (
                    <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/10 dark:text-green-400 p-3 rounded-md">
                        ✅ Your data is automatically synced to the cloud.
                    </p>
                )}
            </div>

            <ProfileForm />
        </div>
    );
};

export default ProfilePage;
