import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../context/StoreContext';
import { format } from 'date-fns';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';

const WelcomeBanner = () => {
    const { profile } = useStore();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    return (
        <Card className="relative overflow-hidden border-0 shadow-lg bg-medical-900 text-white min-h-[180px] mb-8 group">
            {/* Background Gradient/Image */}
            <div className="absolute inset-0 bg-gradient-to-r from-medical-900 via-medical-800 to-medical-600/40 z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-medical-900 via-medical-800 to-medical-600/40 z-10" />

            <CardContent className="relative z-20 flex flex-col justify-center h-full py-8 md:px-8">
                <span className="inline-flex items-center w-fit px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-md mb-4 border border-white/20 shadow-sm">
                    {format(new Date(), 'EEEE, dd MMMM yyyy')}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight text-white/95">
                    {greeting}, <span className="text-medical-teal">{profile?.name ? profile.name.split(' ')[0] : 'Nurse'}</span>!
                </h1>
                <p className="text-blue-100 text-lg opacity-90 mb-6 max-w-lg font-light">
                    Your next shift matters. Stay organized and ready.
                </p>

                <Link to="/roster/calendar">
                    <Button variant="secondary" className="bg-white text-medical-900 hover:bg-white/90 font-bold shadow-lg shadow-black/10 transition-transform active:scale-95">
                        Open Calendar
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};

export default WelcomeBanner;
