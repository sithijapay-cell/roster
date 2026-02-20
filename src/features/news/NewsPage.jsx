import { useState, useEffect, useMemo } from 'react';
import { fetchNews } from '../../services/newsService';
import { useStore } from '../../context/StoreContext';
import { Loader2, Bell, Calendar as CalendarIcon, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import NewsCard from './components/NewsCard';
import { format, isFuture, isToday, parseISO } from 'date-fns';

const NewsPage = () => {
    const { shifts } = useStore();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch on mount + auto-refresh every hour
    useEffect(() => {
        loadFeed();

        const intervalId = setInterval(() => {
            loadFeed(true); // silent refresh
        }, 60 * 60 * 1000); // 1 hour

        return () => clearInterval(intervalId);
    }, []);

    const loadFeed = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
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

    // Priority Cards (Next Shift / Leave)
    const priorityCards = useMemo(() => {
        const cards = [];

        const upcomingShifts = Object.entries(shifts)
            .filter(([dateStr]) => {
                try {
                    return isFuture(parseISO(dateStr)) || isToday(parseISO(dateStr));
                } catch { return false; }
            })
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .slice(0, 3);

        const nextDuty = upcomingShifts.find(([_, data]) =>
            data?.shifts?.length > 0 && !['DO', 'PH', 'CL', 'VL'].includes(data.type)
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

        const nextLeave = upcomingShifts.find(([_, data]) =>
            data?.type && ['CL', 'VL', 'PH', 'PH_LEAVE'].includes(data.type)
        );

        if (nextLeave) {
            const [dateStr, data] = nextLeave;
            cards.push({
                id: 'next-leave',
                type: 'priority',
                title: 'Upcoming Leave',
                message: `You have ${data.type === 'PH_LEAVE' ? 'PH Leave' : data.type} on ${format(parseISO(dateStr), 'MMM d')}.`,
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
                    <h1 className="text-3xl font-bold text-foreground">Smart Feed</h1>
                    <p className="text-muted-foreground mt-1">Updates, education, and your roster alerts.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => loadFeed()} disabled={loading} className="text-muted-foreground">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <div className="relative">
                        <Bell className="w-6 h-6 text-muted-foreground" />
                        {(priorityCards.length > 0) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />}
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Curating your smart feed...</p>
                </div>
            ) : (
                <div className="space-y-6 max-w-2xl mx-auto">

                    {/* Priority Section */}
                    {priorityCards.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Priority Alerts</h2>
                            {priorityCards.map(card => (
                                <Card key={card.id} className="border-border shadow-lg overflow-hidden relative bg-card">
                                    <div className={`absolute inset-y-0 left-0 w-1.5 ${card.color}`} />
                                    <CardContent className="p-5 flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${card.color} text-white`}>
                                            <card.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">{card.title}</h3>
                                            <p className="text-muted-foreground mt-1">{card.message}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="text-center py-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                            <p>{error}</p>
                            <Button variant="link" onClick={() => loadFeed()} className="text-destructive">Retry</Button>
                        </div>
                    )}

                    {/* News Feed */}
                    <div className="space-y-6">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Latest Updates</h2>

                        {news.length > 0 ? (
                            news.map((article, index) => (
                                <NewsCard key={index} article={article} />
                            ))
                        ) : !error && (
                            <div className="text-center py-10 bg-muted rounded-xl border border-dashed border-border">
                                <p className="text-muted-foreground">No new updates right now. Check back later!</p>
                                <Button variant="link" onClick={() => loadFeed()}>Refresh</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsPage;
