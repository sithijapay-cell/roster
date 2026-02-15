import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../../context/StoreContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/Card';
import { HeartPulse } from 'lucide-react';

const SignupPage = () => {
    const { signupWithEmail, loginWithGoogle, user } = useStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/roster', { replace: true });
        }
    }, [user, navigate]);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        // Passing empty profile data for now, user can update later
        const result = await signupWithEmail(email, password, {});

        if (result.success) {
            navigate('/roster', { replace: true });
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const result = await loginWithGoogle();
            if (result.success) {
                navigate('/roster', { replace: true });
            } else {
                setError(result.error);
                setLoading(false);
            }
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md border-0 shadow-xl ring-1 ring-border/50 sm:border sm:ring-0">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <HeartPulse className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-primary">Create an account</CardTitle>
                    <CardDescription>
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <form onSubmit={handleSignup} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nurse@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">Confirm Password</label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button className="w-full" type="submit" loading={loading} disabled={loading}>
                            Create Account
                        </Button>
                    </form>

                    <Button variant="outline" type="button" disabled={loading} onClick={handleGoogleLogin} className="w-full mt-2">
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Sign up with Google
                    </Button>

                </CardContent>
                <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
                    <div>
                        Already have an account?{" "}
                        <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SignupPage;
