import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, FileText, Users, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/Button';
import { useStore } from '../context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const Home = () => {
    const { user, openAuthModal } = useStore();

    return (
        <div className="text-foreground -mt-16 sm:mt-0">
            <Helmet>
                <title>Sri Lankan Nurses Hub | Smart Tools for Healthcare Professionals</title>
                <meta name="description" content="The ultimate platform for Sri Lankan Nursing Officers. Automated Roster Management, OT Calculation (Form 108), and Professional Resources." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 pt-20">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-400/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50" />
                </div>

                <div className="container px-4 md:px-6 relative z-10 text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide mb-6">
                            TRUSTED BY HEALTHCARE PROFESSIONALS
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
                            Empowering <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">
                                Sri Lankan Nurses
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        The all-in-one platform for effortless roster planning, precise OT calculations, and continuous professional development.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                    >
                        {user ? (
                            <Link to="/roster">
                                <Button size="lg" className="shadow-xl shadow-primary/25 text-lg h-14 px-8">
                                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                size="lg"
                                onClick={() => openAuthModal('signup')}
                                className="shadow-xl shadow-primary/25 text-lg h-14 px-8"
                            >
                                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        )}
                        <Link to="/news">
                            <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-2">
                                Latest News
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Clock className="w-10 h-10 text-primary" />}
                            title="Smart Roster"
                            description="Intelligent calendar system that handles shifts, exchanges, and leave requests seamlessly."
                        />
                        <FeatureCard
                            icon={<FileText className="w-10 h-10 text-teal-500" />}
                            title="Instant OT Forms"
                            description="Generate error-free Form 108 Overtime claims formatted for print in seconds."
                        />
                        <FeatureCard
                            icon={<Globe className="w-10 h-10 text-indigo-500" />}
                            title="Global News"
                            description="Stay ahead with real-time updates on local health directives and global nursing trends."
                        />
                        <FeatureCard
                            icon={<Shield className="w-10 h-10 text-emerald-500" />}
                            title="Secure & Private"
                            description="Your data is encrypted and synced securely. Privacy first, always."
                        />
                        <FeatureCard
                            icon={<Users className="w-10 h-10 text-rose-500" />}
                            title="Community"
                            description="Join a growing network of nursing professionals sharing resources and opportunities."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <Card className="group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-none bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        <CardHeader>
            <div className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 group-hover:scale-110 transition-transform duration-300 w-fit">
                {icon}
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {description}
            </p>
        </CardContent>
    </Card>
);

export default Home;


