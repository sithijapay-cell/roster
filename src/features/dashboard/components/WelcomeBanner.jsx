import React, { useEffect, useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { format } from 'date-fns';

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
        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-blue-900 text-white min-h-[180px] flex items-center mb-8">
            {/* Background Image / Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-600/40 z-10" />
            <img
                src="/dashboard_banner_medical.png"
                alt="Medical Banner"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }} // Fallback if image missing
            />

            {/* Content */}
            <div className="relative z-20 px-8 py-6 max-w-2xl">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-sm mb-4 border border-white/20">
                    {format(new Date(), 'EEEE, dd MMMM yyyy')}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {greeting}, {profile?.name ? profile.name.split(' ')[0] : 'Nurse'}!
                </h1>
                <p className="text-blue-100 text-lg opacity-90">
                    Ready to manage your roster efficiently today?
                </p>
            </div>
        </div>
    );
};

export default WelcomeBanner;
