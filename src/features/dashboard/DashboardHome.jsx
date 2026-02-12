import React from 'react';
import WelcomeBanner from '../components/WelcomeBanner';
import StatsOverview from '../components/StatsOverview';
import QuickActions from '../components/QuickActions';
import UpcomingShifts from '../components/UpcomingShifts';

const DashboardHome = () => {
    return (
        <div className="animate-in fade-in duration-500">
            <WelcomeBanner />
            <StatsOverview />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <UpcomingShifts />
                </div>
                <div>
                    <QuickActions />
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
