import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, User, Settings, PlusCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

const ActionButton = ({ to, icon: Icon, label, color }) => (
    <Link to={to} className="group">
        <Card className="border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="p-6 flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-full ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
            </div>
        </Card>
    </Link>
);

const QuickActions = () => {
    return (
        <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 px-1">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ActionButton
                    to="/roster/calendar"
                    icon={Calendar}
                    label="View Calendar"
                    color="bg-blue-500"
                />
                <ActionButton
                    to="/roster/summary"
                    icon={FileText}
                    label="Generate OT"
                    color="bg-purple-500"
                />
                <ActionButton
                    to="/roster/profile"
                    icon={User}
                    label="My Profile"
                    color="bg-pink-500"
                />
                <ActionButton
                    to="/roster"
                    icon={PlusCircle}
                    label="Request Leave"
                    color="bg-orange-500"
                />
            </div>
        </div>
    );
};

export default QuickActions;
