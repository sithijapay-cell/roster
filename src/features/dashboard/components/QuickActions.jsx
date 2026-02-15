import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, User, PlusCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

const ActionButton = ({ to, icon: Icon, label, colorClass, iconColor }) => (
    <Link to={to} className="group">
        <Card className="border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full">
            <div className="p-4 flex flex-col items-center text-center gap-3 h-full justify-center">
                <div className={`p-3 rounded-full ${colorClass} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{label}</span>
            </div>
        </Card>
    </Link>
);

const QuickActions = () => {
    return (
        <div>
            <h3 className="text-lg font-bold text-foreground mb-4 px-1">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
                <ActionButton
                    to="/roster/calendar"
                    icon={Calendar}
                    label="View Roster"
                    colorClass="bg-blue-50"
                    iconColor="text-blue-600"
                />
                <ActionButton
                    to="/roster/ot"
                    icon={FileText}
                    label="OT Claims"
                    colorClass="bg-purple-50"
                    iconColor="text-purple-600"
                />
                <ActionButton
                    to="/roster/profile"
                    icon={User}
                    label="My Profile"
                    colorClass="bg-pink-50"
                    iconColor="text-pink-600"
                />
                {/* Placeholder for future features or just a direct link to add shift if needed */}
                <ActionButton
                    to="/roster/calendar"
                    icon={PlusCircle}
                    label="Add Shift"
                    colorClass="bg-emerald-50"
                    iconColor="text-emerald-600"
                />
            </div>
        </div>
    );
};

export default QuickActions;
