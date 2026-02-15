import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../../context/StoreContext'; // Using store for logic
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/Card';
import { HeartPulse } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../../../components/ui/Dialog'; // Import if needed for modal
// We are building a full page here, but we can also use it in a modal context if we refactor.
// For now, let's build the page.

const LoginPage = () => {
    const { loginWithEmail, loginWithGoogle, user } = useStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/roster', { replace: true });
        }
    }, [user, navigate]);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await loginWithEmail(email, password);

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
                    <CardTitle className="text-2xl font-bold tracking-tight text-primary">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your email to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <form onSubmit={handleEmailLogin} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
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
                            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button className="w-full" type="submit" loading={loading} disabled={loading}>
                            Sign In
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <Button variant="outline" type="button" disabled={loading} onClick={handleGoogleLogin} className="w-full">
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Google
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
                    <div>
                        Don't have an account?{" "}
                        <Link to="/signup" className="underline underline-offset-4 hover:text-primary">
                            Sign up
                        </Link>
                    </div>
                    <Link to="/" className="text-xs hover:text-primary">
                        Return to Home
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
