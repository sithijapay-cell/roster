const Parser = require('rss-parser');
const parser = new Parser();

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

        // Calculate 7 days ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Transform and Filter feed items for last 7 days
        const articles = feed.items
            .filter(item => {
                const itemDate = new Date(item.isoDate || item.pubDate);
                // Check if date is valid and recent
                return !isNaN(itemDate) && itemDate >= oneWeekAgo;
            })
            .map(item => ({
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
