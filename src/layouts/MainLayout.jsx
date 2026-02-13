import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingBag, Info, Home, Newspaper, Moon, Sun, LogIn, User as UserIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../context/StoreContext';
import AuthModal from '../features/auth/components/AuthModal';
import UserMenu from '../components/layout/UserMenu';

const MainLayout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();
    const { user, isAuthModalOpen, closeAuthModal, openAuthModal, authModalView } = useStore();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navItems = [
        { label: 'Home', path: '/', icon: Home },
        { label: 'About', path: '/about', icon: Info },
        { label: 'Tools', path: '/tools', icon: ShoppingBag },
        { label: 'Tech News', path: '/news', icon: Newspaper },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20 selection:text-primary">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-multiply animate-pulse duration-[10s]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full mix-blend-multiply animate-pulse duration-[7s]" />
            </div>

            <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="relative z-50 flex items-center gap-3 group">
                        <div className="flex items-center tracking-tight">
                            <span className="font-bold text-2xl text-foreground">SL Nurses</span>
                            <span className="font-light text-2xl text-primary ml-1">Hub</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                            aria-label="Toggle dark mode"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        {user ? (
                            <UserMenu />
                        ) : (
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => openAuthModal('login')}
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Log In
                                </Button>
                                <Button
                                    onClick={() => openAuthModal('signup')}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 py-2"
                                >
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden z-50 text-foreground" onClick={toggleMenu}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Nav Overlay */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border p-6 md:hidden flex flex-col space-y-4 shadow-xl"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`text-lg font-medium transition-colors hover:text-primary flex items-center gap-3 ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </header>

            <main className="relative z-10 pt-20">
                {children}
            </main>

            <footer className="relative z-10 bg-card border-t border-border py-12 mt-20">
                <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
                    <p>© {new Date().getFullYear()} Sri Lankan Nurses Hub. All rights reserved.</p>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                initialView={authModalView}
            />
        </div>
    );
};

export default MainLayout;
