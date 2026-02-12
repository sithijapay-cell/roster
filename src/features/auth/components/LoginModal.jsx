import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ onClose, onSwitchToSignup }) => {
    const { loginWithEmail, loginWithGoogle } = useStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await loginWithEmail(email, password);

        if (result.success) {
            onClose();
            navigate('/roster');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const result = await loginWithGoogle();
            if (result.success) {
                onClose();
                navigate('/roster');
            } else {
                setError(result.error);
            }
        } catch (error) {
            console.error("Google login error in modal:", error);
            setError("Failed to sign in with Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Sign in to access your account</p>

            {/* Google Login */}
            <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 mb-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
                {loading ? 'Connecting...' : 'Continue with Google'}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or continue with email</span>
                </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>

            {/* Switch to Signup */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                Don't have an account?{' '}
                <button
                    onClick={onSwitchToSignup}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                    Sign up
                </button>
            </p>
        </div>
    );
};

export default LoginModal;
