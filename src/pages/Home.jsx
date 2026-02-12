import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, FileText, Users, Shield, Globe, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/Button';
import { useStore } from '../context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const Home = () => {
    const { user, openAuthModal } = useStore();

    return (
        <div className="text-foreground -mt-16 sm:mt-0 overflow-hidden">
            <Helmet>
                <title>Sri Lankan Nurses Hub | Next-Gen Healthcare Tools</title>
                <meta name="description" content="The ultimate platform for Sri Lankan Nursing Officers. Automated Roster Management, OT Calculation (Form 108), and Professional Resources." />
            </Helmet>

            {/* Premium Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 pt-20">
                {/* Animated Background Blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[120px] animate-blob" />
                    <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-400/30 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-teal-400/30 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000" />
                </div>

                <div className="container px-4 md:px-6 relative z-10 text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 shadow-lg text-primary text-sm font-bold tracking-wide mb-8 animate-fade-in hover:scale-105 transition-transform duration-300 cursor-default">
                            <Star className="w-4 h-4 fill-primary" />
                            <span>#1 PLATFORM FOR SL NURSES</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                            Elevate Your <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-pulse-glow">
                                Nursing Career
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed"
                    >
                        Experience the future of healthcare management.
                        <span className="text-slate-900 dark:text-white font-semibold"> Intelligent Rosters</span>,
                        <span className="text-slate-900 dark:text-white font-semibold"> Instant OT</span>, and
                        <span className="text-slate-900 dark:text-white font-semibold"> Global Opportunities</span>.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8"
                    >
                        {user ? (
                            <Link to="/roster">
                                <Button size="lg" className="h-16 px-10 text-xl rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-all shadow-blue-500/25 shadow-2xl animate-float text-white border-0">
                                    Launch Dashboard <Zap className="ml-2 h-6 w-6" />
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                size="lg"
                                onClick={() => openAuthModal('signup')}
                                className="h-16 px-10 text-xl rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-all shadow-blue-500/25 shadow-2xl animate-float text-white border-0"
                            >
                                Get Started Free <ArrowRight className="ml-2 h-6 w-6" />
                            </Button>
                        )}
                        <Link to="/news">
                            <Button variant="outline" size="lg" className="h-16 px-10 text-xl rounded-2xl border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                Explore News
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="py-32 bg-white dark:bg-slate-950 relative z-10">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-6">
                            Everything You Need to Excel
                        </h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Powerful tools designed specifically for the unique needs of Sri Lankan nursing professionals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        <BentoCard
                            colSpan="md:col-span-2"
                            icon={<Clock className="w-12 h-12 text-blue-500" />}
                            title="Smart Roster Engine"
                            description="Automated shift management that handles complex exchanges and leave requests with zero conflicts."
                            gradient="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                        />
                        <BentoCard
                            icon={<FileText className="w-12 h-12 text-teal-500" />}
                            title="1-Click OT Forms"
                            description="Generate print-ready Form 108 claims instantly. 100% calculation accuracy guaranteed."
                            gradient="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20"
                        />
                        <BentoCard
                            icon={<Globe className="w-12 h-12 text-purple-500" />}
                            title="Global Nexus"
                            description="Real-time news aggregator tracking international nursing trends and migration opportunities."
                            gradient="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                        />
                        <BentoCard
                            colSpan="md:col-span-2"
                            icon={<Shield className="w-12 h-12 text-indigo-500" />}
                            title="Military-Grade Privacy"
                            description="Your roster data is encrypted and stored locally. We prioritize your privacy above everything else."
                            gradient="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const BentoCard = ({ colSpan = "", icon, title, description, gradient }) => (
    <Card className={`group relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${colSpan} ${gradient}`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-150 duration-700">
            {React.cloneElement(icon, { className: "w-48 h-48" })}
        </div>
        <CardHeader className="relative z-10 pt-10 px-8">
            <div className="mb-6 p-4 rounded-2xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl w-fit shadow-sm ring-1 ring-black/5">
                {icon}
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 px-8 pb-10">
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {description}
            </p>
        </CardContent>
    </Card>
);

export default Home;
