import { useState, useEffect, useMemo } from 'react';
import { fetchNews } from '../../services/newsService';
import { useStore } from '../../context/StoreContext';
import { Loader2, Bell, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import NewsCard from './components/NewsCard';
import { format, isFuture, isToday, parseISO, addDays } from 'date-fns';

const NewsPage = () => {
    const { shifts, profile } = useStore();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch News on Mount
    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        setLoading(true);
        try {
            const data = await fetchNews();
            setNews(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load feed.');
        } finally {
            setLoading(false);
        }
    };

    // 2. Generate Priority Cards (Next Shift / Leave)
    const priorityCards = useMemo(() => {
        const cards = [];
        const today = new Date();

        // Find next items
        const upcomingShifts = Object.entries(shifts)
            .filter(([dateStr]) => isFuture(parseISO(dateStr)) || isToday(parseISO(dateStr)))
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .slice(0, 3); // Get next few

        // Next Shift
        const nextDuty = upcomingShifts.find(([_, data]) =>
            !['OFF', 'PH', 'SIL', 'CAS', 'VAC'].includes(data.shifts[0])
        );

        if (nextDuty) {
            const [dateStr, data] = nextDuty;
            cards.push({
                id: 'next-shift',
                type: 'priority',
                title: 'Next Shift',
                message: `You are scheduled for ${data.shifts.join(', ')} on ${format(parseISO(dateStr), 'EEEE, MMM d')}`,
                icon: Clock,
                color: 'bg-indigo-600'
            });
        }

        // Upcoming Leave
        const nextLeave = upcomingShifts.find(([_, data]) =>
            ['CAS', 'VAC', 'M/L'].includes(data.shifts[0])
        );

        if (nextLeave) {
            const [dateStr, data] = nextLeave;
            cards.push({
                id: 'next-leave',
                type: 'priority',
                title: 'Upcoming Leave',
                message: `Relax! You have ${data.shifts[0]} on ${format(parseISO(dateStr), 'MMM d')}.`,
                icon: CalendarIcon,
                color: 'bg-emerald-600'
            });
        }

        return cards;
    }, [shifts]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Smart Feed</h1>
                    <p className="text-slate-500 mt-1">Updates, education, and your roster alerts.</p>
                </div>
                <div className="relative">
                    <Bell className="w-6 h-6 text-slate-400" />
                    {(priorityCards.length > 0) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-slate-400">Curating your smart feed...</p>
                </div>
            ) : (
                <div className="space-y-6 max-w-2xl mx-auto">

                    {/* Priority Section */}
                    {priorityCards.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Priority Alerts</h2>
                            {priorityCards.map(card => (
                                <Card key={card.id} className="border-0 shadow-lg overflow-hidden relative">
                                    <div className={`absolute inset-y-0 left-0 w-1.5 ${card.color}`} />
                                    <CardContent className="p-5 flex items-start gap-4">
                                        <div className={`p-3 rounded-full bg-slate-50 text-white ${card.color.replace('bg-', 'text-')}`}>
                                            <card.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{card.title}</h3>
                                            <p className="text-slate-600 mt-1">{card.message}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* News Feed */}
                    <div className="space-y-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Latest Updates</h2>

                        {news.length > 0 ? (
                            news.map((article, index) => (
                                <NewsCard key={index} article={article} />
                            ))
                        ) : (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed">
                                <p className="text-slate-500">No new updates right now. Check back later!</p>
                                <Button variant="link" onClick={loadFeed}>Refresh</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsPage;
