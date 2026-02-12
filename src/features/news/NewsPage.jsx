import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, MapPin, Plane, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button'; // Assuming you have a button component
import NewsCard from './components/NewsCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const NewsPage = () => {
    const [activeTab, setActiveTab] = useState('local');
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const categories = [
        { id: 'local', label: 'Sri Lanka', icon: MapPin },
        { id: 'global', label: 'Global Nursing', icon: Globe },
        { id: 'migration', label: 'Migration Opportunities', icon: Plane },
    ];

    useEffect(() => {
        fetchNews(activeTab);
    }, [activeTab]);

    const fetchNews = async (category) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/news?category=${category}`);
            setNews(response.data.articles || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load news. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">News</h1>
                <p className="text-slate-500 mt-2">Latest updates, trends, and opportunities for nurses.</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200">
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeTab === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-slate-400">Fetching latest updates...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-red-600 font-medium">{error}</p>
                    <Button
                        variant="outline"
                        className="mt-4 border-red-200 text-red-600 hover:bg-red-100"
                        onClick={() => fetchNews(activeTab)}
                    >
                        Try Again
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((article, index) => (
                        <NewsCard key={index} article={article} />
                    ))}
                    {news.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-400">
                            No news articles found for this category.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NewsPage;
