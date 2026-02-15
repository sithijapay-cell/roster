import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../features/auth/context/AuthContext';
import { Button } from '../ui/Button';

const UserMenu = () => {
    const { user, profile } = useStore();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            setIsOpen(false);
            // Verify logout before navigating? 
            // Better to rely on AuthContext state change, but force nav for now.
            navigate('/');
            window.location.reload(); // Force reload to clear any lingering stated
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (!user) return null;

    // Get initials for avatar
    const getInitials = () => {
        if (profile?.name) {
            return profile.name.charAt(0).toUpperCase();
        }
        if (user.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="User menu"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {getInitials()}
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {profile?.name || 'Nurse User'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {user.email}
                            </p>
                        </div>

                        {/* Links */}
                        <div className="p-2 space-y-1">

                            <Link
                                to="/roster/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <User size={16} />
                                My Profile
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />

                        {/* Logout */}
                        <div className="p-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserMenu;
