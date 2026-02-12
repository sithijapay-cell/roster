import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, FileText, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/Button';
import { useStore } from '../context/StoreContext';

const Home = () => {
    const { user, openAuthModal } = useStore();

    return (
        <div className="text-foreground">
            <Helmet>
                <title>Sri Lankan Nurses Hub | Smart Tools for Healthcare Professionals</title>
                <meta name="description" content="The ultimate platform for Sri Lankan Nursing Officers. Automated Roster Management, OT Calculation (Form 108), and Professional Resources." />
                <meta name="keywords" content="Nurses Roster, OT Calculation, Sri Lanka Health, Form 108, Nursing Hub" />
            </Helmet>
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
                <div className="container px-4 md:px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
                            Empowering
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-600">Sri Lankan Nurses</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light leading-relaxed"
                    >
                        Simplify your professional life with next-generation roster management, automated OT forms, and essential resources.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col md:flex-row gap-4 justify-center"
                    >
                        {user ? (
                            <Link to="/roster">
                                <Button className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                                    Go to Roster <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                onClick={() => openAuthModal('signup')}
                                className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-1"
                            >
                                Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        )}
                        <Link to="/about">
                            <Button variant="outline" className="h-14 px-8 text-lg rounded-full border-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all">
                                Learn More
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen opacity-50" />
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-card/50">
                <div className="container px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Clock className="w-8 h-8 text-primary" />}
                            title="Smart Roster"
                            description="Effortlessly manage shifts, exchanges, and leave with our intelligent calendar system."
                        />
                        <FeatureCard
                            icon={<FileText className="w-8 h-8 text-teal-500" />}
                            title="Instant OT Forms"
                            description="Generate precise Form 108 Overtime claims in seconds. Error-free and print-ready."
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-emerald-500" />}
                            title="Secure & Private"
                            description="Your profile and duty data are stored locally on your device for maximum privacy."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const FeatureCard = ({ icon, title, description }) => (
    <Card className="hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border-border bg-card">
        <CardHeader>
            <div className="mb-2 p-3 rounded-xl bg-accent shadow-sm w-fit border border-border">
                {icon}
            </div>
            <CardTitle className="text-xl text-card-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground leading-relaxed">
                {description}
            </p>
        </CardContent>
    </Card>
);

export default Home;
