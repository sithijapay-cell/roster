import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Heart, MessageCircle, Hash, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';

const News = () => {
    // Mock Data for Healthcare News
    const mockNews = [
        {
            id: 1,
            title: "Ministry of Health Announces New Roster Guidelines",
            description: "An update on the latest circular regarding nursing officer shift scheduling and overtime regulations.",
            cover_image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070",
            published_at: new Date().toISOString(),
            user: { name: "Ministry Desk", profile_image_90: "https://ui-avatars.com/api/?name=Ministry+Health&background=0D8ABC&color=fff" },
            tag_list: ["regulations", "srilanka"],
            public_reactions_count: 120,
            comments_count: 45,
            url: "#"
        },
        {
            id: 2,
            title: "Digital Health: The Future of Nursing in Sri Lanka",
            description: "How digital tools and electronic health records are transforming patient care in local hospitals.",
            cover_image: "https://images.unsplash.com/photo-1516549655169-df83a0050866?auto=format&fit=crop&q=80&w=2070",
            published_at: new Date(Date.now() - 86400000).toISOString(),
            user: { name: "HealthTech SL", profile_image_90: "https://ui-avatars.com/api/?name=Health+Tech&background=10B981&color=fff" },
            tag_list: ["technology", "future"],
            public_reactions_count: 85,
            comments_count: 12,
            url: "#"
        },
        {
            id: 3,
            title: "Wellness Tips for Night Shift Nurses",
            description: "Essential advice on maintaining health, sleep hygiene, and work-life balance while working roster duties.",
            cover_image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=2070",
            published_at: new Date(Date.now() - 172800000).toISOString(),
            user: { name: "Wellness Weekly", profile_image_90: "https://ui-avatars.com/api/?name=Wellness&background=F59E0B&color=fff" },
            tag_list: ["wellness", "lifestyle"],
            public_reactions_count: 230,
            comments_count: 67,
            url: "#"
        }
    ];

    return (
        <div className="text-slate-900 min-h-screen py-24 bg-slate-50">
            <div className="container px-4 mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900">
                            Healthcare <span className="text-blue-600">Insights</span>
                        </h1>
                        <p className="text-slate-500 text-lg max-w-2xl">
                            Curated news, updates, and resources for the Sri Lankan nursing community.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-blue-700 font-medium text-sm">
                        <Activity size={16} />
                        UPDATES
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockNews.map((item, index) => (
                        <NewsCard key={item.id} item={item} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const NewsCard = ({ item, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group relative bg-white hover:shadow-xl border border-slate-200 hover:border-blue-200 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full"
    >
        {/* Image */}
        <div className="h-48 overflow-hidden relative">
            <img
                src={item.cover_image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4">
                <div className="flex gap-2">
                    {item.tag_list.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs font-bold px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-slate-700 capitalize shadow-sm">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center gap-2 mb-4">
                <img src={item.user.profile_image_90} alt={item.user.name} className="w-8 h-8 rounded-full border border-slate-200" />
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700">{item.user.name}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(item.published_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-3 leading-tight text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {item.title}
            </h3>

            <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                {item.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><Heart size={14} className="text-red-400" /> {item.public_reactions_count}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={14} className="text-blue-400" /> {item.comments_count}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 gap-2 p-0 h-auto hover:bg-transparent">
                    Read More <ExternalLink size={14} />
                </Button>
            </div>
        </div>
    </motion.div>
);

export default News;
