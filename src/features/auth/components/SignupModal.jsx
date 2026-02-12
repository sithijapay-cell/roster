import React, { useState } from 'react';
import { Mail, Lock, User, Briefcase, Building2 } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const SignupModal = ({ onClose, onSwitchToLogin }) => {
    const { signupWithEmail, sendVerification, loginWithGoogle } = useStore();
    const navigate = useNavigate();
    const [verificationSent, setVerificationSent] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        grade: '',
        designation: '',
        institution: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const profileData = {
            name: formData.name,
            grade: formData.grade,
            designation: formData.designation,
            institution: formData.institution,
            salaryNumber: '',
            basicSalary: '',
            otRate: '',
            ward: ''
        };

        const result = await signupWithEmail(formData.email, formData.password, profileData);

        if (result.success) {
            // Send verification email
            await sendVerification();
            setVerificationSent(true);
            setLoading(false);
            // Don't close immediately, show message
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    if (verificationSent) {
        return (
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    We've sent a verification link to <strong>{formData.email}</strong>. Please verify your email to complete registration.
                </p>
                <div className="space-y-3">
                    <Button
                        onClick={() => {
                            onClose();
                            navigate('/roster');
                        }}
                        className="w-full bg-blue-600 text-white"
                    >
                        I've Verified My Email
                    </Button>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Sign up to get started</p>

            {/* Google Signup */}
            <Button
                onClick={async () => {
                    const result = await loginWithGoogle();
                    if (result.success) {
                        onClose();
                        navigate('/roster');
                    }
                }}
                className="w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 mb-4"
            >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
                Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or sign up with email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Password *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Confirm Password *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Full Name *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                </div>

                {/* Grade & Designation */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Grade
                        </label>
                        <input
                            type="text"
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="e.g., III"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Designation
                        </label>
                        <input
                            type="text"
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="Nurse"
                        />
                    </div>
                </div>

                {/* Institution */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Institution
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            name="institution"
                            value={formData.institution}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="Hospital Name"
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
                    {loading ? 'Creating account...' : 'Create Account'}
                </Button>
            </form>

            {/* Switch to Login */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                Already have an account?{' '}
                <button
                    onClick={onSwitchToLogin}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                    Sign in
                </button>
            </p>
        </div>
    );
};

export default SignupModal;
