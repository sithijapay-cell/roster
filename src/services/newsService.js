const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';

// Source Configurations
const SOURCES = {
    education: [
        'https://www.nursingtimes.net/feed/', // Nursing Times
        'https://bg.nursingcenter.com/Specific-Feed/Aggregated-Feed/All-Articles', // Nursing Center
        'http://feeds.feedburner.com/Healthline-Health-News', // Healthline
    ],
    news: [
        'https://www.dailymirror.lk/RSS_Feeds/breaking-news', // Daily Mirror SL
        'http://feeds.bbci.co.uk/news/health/rss.xml', // BBC Health
    ],
    migration: [
        'https://www.nmc.org.uk/rss/', // NMC UK
        'https://www.ahpra.gov.au/RSS/News.aspx', // AHPRA (Generic Example, might need adjustment)
    ]
};

// Fallback Google News queries if RSS fails
const GOOGLE_FALLBACKS = {
    education: 'Nursing+Education+OR+Clinical+Practice+Updates',
    news: 'Sri+Lanka+Health+News+OR+Global+Nursing+News',
    migration: 'Nurse+Migration+UK+Australia+Canada'
};

const getImage = (item) => {
    // Try to find image in enclosure or content
    if (item.enclosure?.link) return item.enclosure.link;
    if (item.thumbnail) return item.thumbnail;

    // Regex to find first image in content
    const imgMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];

    // Fallback Unsplash - distinct keywords based on title
    const keywords = item.title.includes('Sri Lanka') ? 'sri lanka,hospital' : 'nurse,medical,doctor';
    return `https://source.unsplash.com/800x600/?${keywords}&sig=${Math.random()}`; // Sig to avoid dupes
};

export const fetchNews = async () => {
    // 1. Check Cache (3 Hour Policy)
    const CACHE_KEY = 'smart_feed_cache';
    const CACHE_TIME_KEY = 'smart_feed_time';
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cachedData && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        // 3 Hours = 3 * 60 * 60 * 1000
        if (age < 3 * 60 * 60 * 1000) {
            console.log(`Using cached smart feed (Age: ${Math.round(age / 1000 / 60)} mins)`);
            return JSON.parse(cachedData);
        }
    }

    let allItems = [];

    // Helper to fetch valid RSS via proxy
    const fetchSource = async (url, category) => {
        try {
            const res = await axios.get(`${RSS2JSON_BASE}${encodeURIComponent(url)}`);
            if (res.data.status === 'ok') {
                return res.data.items.map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    source: res.data.feed.title || "News",
                    category: category,
                    image: getImage(item),
                    contentSnippet: item.description?.replace(/<[^>]*>?/gm, "").substring(0, 120) + "..."
                }));
            }
        } catch (e) {
            console.warn(`Failed to fetch ${url}`, e);
        }
        return [];
    };

    try {
        // Parallel Fetching
        const promises = [
            ...SOURCES.education.map(url => fetchSource(url, 'Education')),
            ...SOURCES.news.map(url => fetchSource(url, 'News')),
            ...SOURCES.migration.map(url => fetchSource(url, 'Migration'))
        ];

        const results = await Promise.all(promises);
        allItems = results.flat();

        // Sort by Date (Newest First)
        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Deduplicate by title
        allItems = allItems.filter((item, index, self) =>
            index === self.findIndex((t) => (t.title === item.title))
        );

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
