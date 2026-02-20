import axios from 'axios';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';

// Source Configurations — reliable, actively maintained feeds
const SOURCES = {
    who: [
        'https://www.who.int/rss-feeds/news-english.xml', // WHO News
    ],
    health: [
        'http://feeds.bbci.co.uk/news/health/rss.xml', // BBC Health
    ],
    youtube: [
        // RegisteredNurseRN YouTube channel RSS
        'https://www.youtube.com/feeds/videos.xml?channel_id=UCqb2GJsCYBF3WK7kFINaSfA',
    ]
};

const getImage = (item, isYouTube = false) => {
    if (isYouTube) {
        // YouTube thumbnails from video ID
        const videoId = item.guid?.match(/yt:video:(.+)/)?.[1] || item.link?.split('v=')[1];
        if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    // Try to find image in enclosure or content
    if (item.enclosure?.link) return item.enclosure.link;
    if (item.thumbnail) return item.thumbnail;

    // Regex to find first image in content
    const imgMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];

    // Fallback placeholder
    return `https://placehold.co/800x400/1e293b/94a3b8?text=${encodeURIComponent(item.title?.substring(0, 30) || 'News')}`;
};

// ─── Fetch Admin-posted news from Firestore ───────────────────
const fetchAdminNews = async () => {
    try {
        const q = query(collection(db, 'admin_news'), orderBy('createdAt', 'desc'), limit(20));
        const snap = await getDocs(q);
        const items = [];
        snap.forEach(docSnap => {
            const data = docSnap.data();
            items.push({
                title: data.title || '',
                link: data.link || '',
                pubDate: data.pubDate || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                source: 'Admin',
                category: data.category || 'Admin Update',
                image: data.imageUrl || `https://placehold.co/800x400/7c3aed/ffffff?text=${encodeURIComponent(data.title?.substring(0, 25) || 'Update')}`,
                isVideo: false,
                isAdmin: true,
                contentSnippet: data.content?.substring(0, 150) + '...'
            });
        });
        return items;
    } catch (err) {
        console.warn('Failed to fetch admin news from Firestore', err.message);
        return [];
    }
};

export const fetchNews = async () => {
    // 1. Check Cache (1 Hour Policy)
    const CACHE_KEY = 'smart_feed_cache';
    const CACHE_TIME_KEY = 'smart_feed_time';
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cachedData && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        // 1 Hour = 60 * 60 * 1000
        if (age < 60 * 60 * 1000) {

            return JSON.parse(cachedData);
        }
    }

    let allItems = [];

    // Helper to fetch valid RSS via rss2json proxy
    const fetchSource = async (url, category, isYouTube = false) => {
        try {
            const res = await axios.get(`${RSS2JSON_BASE}${encodeURIComponent(url)}`);
            if (res.data.status === 'ok') {
                return res.data.items.map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    source: res.data.feed?.title || category,
                    category: category,
                    image: getImage(item, isYouTube),
                    isVideo: isYouTube,
                    contentSnippet: item.description?.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..."
                }));
            }
        } catch (e) {
            console.warn(`Failed to fetch ${url}`, e.message);
        }
        return [];
    };

    try {
        // Parallel Fetching — RSS + Admin Firestore news
        const promises = [
            ...SOURCES.who.map(url => fetchSource(url, 'WHO News')),
            ...SOURCES.health.map(url => fetchSource(url, 'Health')),
            ...SOURCES.youtube.map(url => fetchSource(url, 'Video', true)),
            fetchAdminNews()  // ← Admin-posted news from Firestore
        ];

        const results = await Promise.all(promises);
        allItems = results.flat();

        // Sort by Date (Newest First)
        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Deduplicate by title
        allItems = allItems.filter((item, index, self) =>
            index === self.findIndex((t) => (t.title === item.title))
        );

        // Limit to 30 items max
        allItems = allItems.slice(0, 30);

        // Save to Cache
        if (allItems.length > 0) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(allItems));
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        }

        return allItems;

    } catch (error) {
        console.error("Smart Feed Error:", error);
        if (cachedData) return JSON.parse(cachedData);
        return [];
    }
};

