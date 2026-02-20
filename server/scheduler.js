const cron = require('node-cron');
const { fetchYouTubeUpdates } = require('./services/youtubeService');
const { fetchWHOUpdates } = require('./services/whoService');

const initScheduler = () => {
    console.log('[Scheduler] Initializing automation jobs...');

    // Job 1: YouTube Updates (Every 2 hours)
    // Runs at minute 0 past every 2nd hour
    cron.schedule('0 */2 * * *', async () => {
        console.log('[Scheduler] Triggering YouTube Update...');
        await fetchYouTubeUpdates();
    });

    // Job 2: WHO Updates (Every 4 hours)
    // Runs at minute 0 past every 4th hour
    cron.schedule('0 */4 * * *', async () => {
        console.log('[Scheduler] Triggering WHO Update...');
        await fetchWHOUpdates();
    });

    console.log('[Scheduler] Jobs scheduled: YouTube (2hr), WHO (4hr).');

    // Optional: Run immediately on startup for testing/deployment confirmation
    // setTimeout(() => {
    //     console.log('[Scheduler] Running initial items fetch...');
    //     fetchYouTubeUpdates();
    //     fetchWHOUpdates();
    // }, 5000); 
};

module.exports = { initScheduler };
