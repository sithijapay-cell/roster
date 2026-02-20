const Parser = require('rss-parser');
const { db } = require('../config/firebase');

const rssParser = new Parser();
const WHO_RSS_URL = 'https://www.who.int/rss-feeds/news-english.xml';

const fetchWHOUpdates = async () => {
    console.log('[WHO Service] Starting fetch cycle...');
    try {
        const feed = await rssParser.parseURL(WHO_RSS_URL);
        let newArticlesCount = 0;

        // Process latest 5 items to ensure we catch up, but check duplicates
        const latestItems = feed.items.slice(0, 5);

        for (const item of latestItems) {
            const isNew = await saveToFirestore(item);
            if (isNew) newArticlesCount++;
        }

        console.log(`[WHO Service] Cycle complete. Added ${newArticlesCount} new articles.`);
        return newArticlesCount;

    } catch (error) {
        console.error('[WHO Service] Failed to fetch RSS feed:', error);
    }
};

const saveToFirestore = async (item) => {
    // GUID or Link as unique ID
    const externalId = item.guid || item.link;
    const title = item.title;
    const link = item.link;
    const pubDate = item.pubDate;
    const content = item.contentSnippet || item.content || '';

    // Check if exists
    const newsRef = db.collection('admin_news');
    const snapshot = await newsRef.where('externalId', '==', externalId).get();

    if (!snapshot.empty) {
        return false; // Already exists
    }

    // Extact image if present in content (basic regex), otherwise use default WHO placeholder
    const imageMatch = content.match(/<img[^>]+src="([^">]+)"/);
    const imageUrl = imageMatch ? imageMatch[1] : '';

    // Add to Firestore
    await newsRef.add({
        title: title,
        content: content.substring(0, 200) + '...', // Short preview
        imageUrl: imageUrl, // Might be empty, frontend should handle placeholder
        link: link,
        source: 'WHO',
        sourceName: 'World Health Organization',
        category: 'Health News',
        externalId: externalId,
        type: 'article',
        postedBy: 'auto-bot',
        postedByName: 'Auto Content Engine',
        createdAt: new Date(),
        pubDate: pubDate,
        isVideo: false,
        tags: ['WHO', 'Health', 'Global']
    });

    return true;
};

module.exports = { fetchWHOUpdates };
