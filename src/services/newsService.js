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
    try {
        const feedUrl = buildUrl(category);
        const encodedUrl = encodeURIComponent(feedUrl);
        // Using rss2json for more reliable parsing and CORS handling
        const response = await axios.get(`${RSS2JSON_BASE}${encodedUrl}`);

        if (response.data && response.data.status === 'ok') {
            return response.data.items.map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                source: item.author || "Google News",
                contentSnippet: item.description?.replace(/<[^>]*>?/gm, "") || ""
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching news:", error);
        // Fallback or empty return so app doesn't crash
        return [];
    }
};
