const Parser = require('rss-parser');
const parser = new Parser();

const GOOGLE_NEWS_BASE = 'https://news.google.com/rss/search?q=';
const CONFIG = {
    local: {
        query: 'Sri+Lanka+Nurses+Health+Sector',
        lang: 'en-LK',
        region: 'LK',
        ceid: 'LK:en'
    },
    global: {
        query: 'International+Nursing+Healthcare+Trends',
        lang: 'en-US',
        region: 'US',
        ceid: 'US:en'
    },
    migration: {
        query: 'Nurse+Jobs+Migration+UK+Australia+Canada+from+Sri+Lanka',
        lang: 'en-US',
        region: 'US',
        ceid: 'US:en'
    }
};

const buildUrl = (type) => {
    const { query, lang, region, ceid } = CONFIG[type];
    return `${GOOGLE_NEWS_BASE}${query}&hl=${lang}&gl=${region}&ceid=${ceid}`;
};

const getNews = async (req, res) => {
    try {
        const category = req.query.category || 'local'; // 'local', 'global', 'migration'

        let feedUrl;
        if (CONFIG[category]) {
            feedUrl = buildUrl(category);
        } else {
            // Default to local if invalid category
            feedUrl = buildUrl('local');
        }

        const feed = await parser.parseURL(feedUrl);

        // Transform feed items
        const articles = feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: item.source || 'Google News',
            contentSnippet: item.contentSnippet,
            isoDate: item.isoDate
        }));

        res.json({
            category,
            count: articles.length,
            articles
        });

    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ message: 'Failed to fetch news feed', error: error.message });
    }
};

module.exports = {
    getNews
};
