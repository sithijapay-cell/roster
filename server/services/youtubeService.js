const axios = require('axios');
const { db } = require('../config/firebase');
const { logAdminAction } = require('../utils/logger'); // Assuming a logger utility exists or will be created, otherwise we'll use console

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyC8j6hPjCxCUFp_eBUHv4430aLIw0NJkug';

const CHANNELS = [
    { id: 'UCPY98D5K4Kz8I6Z_W2U4YyA', name: 'RegisteredNurseRN' },
    { id: 'UC6jBclVlPz9W19Z_V6j5fEg', name: 'Nurse Blake' },
    { id: 'UCVp697O9_4_pY_7V_8Fj1uA', name: 'Simple Nursing' }
];

const SEARCH_QUERY = 'Nursing news Sinhala';

const fetchYouTubeUpdates = async () => {
    console.log('[YouTube Service] Starting fetch cycle...');
    try {
        let newVideosCount = 0;

        // 1. Fetch from Channels
        for (const channel of CHANNELS) {
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        key: YOUTUBE_API_KEY,
                        channelId: channel.id,
                        part: 'snippet',
                        order: 'date',
                        maxResults: 2,
                        type: 'video'
                    }
                });

                const videos = response.data.items;
                for (const video of videos) {
                    const isNew = await saveToFirestore(video, channel.name);
                    if (isNew) newVideosCount++;
                }
            } catch (err) {
                console.error(`[YouTube Service] Failed to fetch for ${channel.name}:`, err.message);
            }
        }

        // 2. Fetch from Search (Sri Lanka Health Ministry context)
        try {
            const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    key: YOUTUBE_API_KEY,
                    q: SEARCH_QUERY,
                    part: 'snippet',
                    order: 'date',
                    maxResults: 2,
                    type: 'video'
                }
            });

            const searchVideos = searchResponse.data.items;
            for (const video of searchVideos) {
                const isNew = await saveToFirestore(video, 'YouTube Search (SL Health)');
                if (isNew) newVideosCount++;
            }
        } catch (err) {
            console.error(`[YouTube Service] Failed to fetch search query:`, err.message);
        }

        console.log(`[YouTube Service] Cycle complete. Added ${newVideosCount} new videos.`);
        return newVideosCount;

    } catch (error) {
        console.error('[YouTube Service] Critical Error:', error);
    }
};

const saveToFirestore = async (video, sourceName) => {
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.high.url || video.snippet.thumbnails.medium.url;
    const publishTime = video.snippet.publishedAt;

    // Check if exists
    const newsRef = db.collection('admin_news');
    const snapshot = await newsRef.where('externalId', '==', videoId).get();

    if (!snapshot.empty) {
        return false; // Already exists
    }

    // Add to Firestore
    await newsRef.add({
        title: title,
        content: `New video from ${sourceName}`,
        imageUrl: thumbnail,
        link: `https://www.youtube.com/watch?v=${videoId}`,
        source: 'YouTube',
        sourceName: sourceName,
        category: 'Education',
        externalId: videoId,
        type: 'video',
        postedBy: 'auto-bot',
        postedByName: 'Auto Content Engine',
        createdAt: new Date(), // Local server time
        pubDate: publishTime,
        isVideo: true,
        tags: ['Nursing', sourceName]
    });

    return true;
};

module.exports = { fetchYouTubeUpdates };
