import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
    const [view, setView] = useState(initialView); // 'login' or 'signup'

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                {view === 'login' ? (
                    <LoginModal onClose={onClose} onSwitchToSignup={() => setView('signup')} />
                ) : (
                    <SignupModal onClose={onClose} onSwitchToLogin={() => setView('login')} />
                )}
            </div>
        </div>
    );
};

export default AuthModal;
