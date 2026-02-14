import axios from 'axios';

// Public CORS Proxy to bypass CORS restriction when fetching RSS/News
const PROXY_URL = 'https://api.allorigins.win/get?url=';
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
        const response = await axios.get(`${PROXY_URL}${encodedUrl}`);

        if (response.data && response.data.contents) {
            // Parse XML content
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response.data.contents, "text/xml");
            const items = xmlDoc.querySelectorAll("item");

            const articles = Array.from(items).map(item => ({
                title: item.querySelector("title")?.textContent || "",
                link: item.querySelector("link")?.textContent || "",
                pubDate: item.querySelector("pubDate")?.textContent || "",
                source: item.querySelector("source")?.textContent || "Google News",
                contentSnippet: item.querySelector("description")?.textContent?.replace(/<[^>]*>?/gm, "") || "" // Strip HTML
            }));

            return articles;
        }
        return [];
    } catch (error) {
        console.error("Error fetching news:", error);
        throw error;
    }
};
