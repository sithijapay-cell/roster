const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';
const GOOGLE_NEWS_BASE = 'https://news.google.com/rss/search?q=';

const CONFIG = {
    local: {
        query: 'Sri+Lanka+Nurses+OR+Ministry+of+Health+Sri+Lanka+OR+Health+Sector+Sri+Lanka',
        lang: 'en-LK',
        region: 'LK',
        ceid: 'LK:en'
    },
    global: {
        query: 'International+Nursing+OR+Healthcare+News+OR+Medical+Research+OR+WHO+News',
        lang: 'en-US',
        region: 'US',
        ceid: 'US:en'
    },
    migration: {
        query: 'Nurse+Jobs+Abroad+OR+Migration+UK+Australia+Canada+from+Sri+Lanka+OR+Foreign+Nursing+Vacancies',
        lang: 'en-US',
        region: 'US',
        ceid: 'US:en'
    }
};

const buildUrl = (type) => {
    const { query, lang, region, ceid } = CONFIG[type] || CONFIG.local;
    return `${GOOGLE_NEWS_BASE}${query}&hl=${lang}&gl=${region}&ceid=${ceid}`;
};

export const fetchNews = async (category = 'local') => {
    // 1. Check Cache
    const CACHE_KEY = `news_cache_${category}`;
    const CACHE_TIME_KEY = `news_time_${category}`;
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    // 24 Hour Refresh Policy
    if (cachedData && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < 24 * 60 * 60 * 1000) {
            console.log(`Using cached news for ${category} (Age: ${Math.round(age / 1000 / 60)} mins)`);
            return JSON.parse(cachedData);
        }
    }

    try {
        const feedUrl = buildUrl(category);
        const encodedUrl = encodeURIComponent(feedUrl);
        // Using rss2json for more reliable parsing and CORS handling
        const response = await axios.get(`${RSS2JSON_BASE}${encodedUrl}`);

        if (response.data && response.data.status === 'ok') {
            const items = response.data.items || [];

            // Filter keywords
            const KEYWORDS = ['Nurse', 'Nursing', 'Health', 'Hospital', 'Visa', 'Migration', 'NHSL', 'Salary', 'Medical', 'Patient'];
            const filtered = items.filter(item => {
                const text = `${item.title} ${item.description}`.toLowerCase();
                return KEYWORDS.some(k => text.includes(k.toLowerCase()));
            }).map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                source: item.author || response.data.feed?.title || "News",
                contentSnippet: item.description?.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..." || ""
            }));

            // Save to Cache
            if (filtered.length > 0) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
                localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
            }

            return filtered;
        }
        return [];
    } catch (error) {
        console.error("Error fetching news:", error);
        // Return cached data if fetch fails (offline mode)
        if (cachedData) return JSON.parse(cachedData);
        return [];
    }
};
