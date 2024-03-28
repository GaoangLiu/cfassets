const action = require('./../models/actions.js');
const channel_monitor = require('./../models/monitor.js');
const { DailyAlertPoster } = require('./../models/daily_alerts.js');

module.exports = async function scheduledTasks() {
    const [monitorResult, actionResult, alertResult] = await
        Promise.all([
            channel_monitor(true),
            action(),
            new DailyAlertPoster().handle()]);
    const json = JSON.stringify({
        "YouTubeChannelMontor": monitorResult,
        "DockerRepoManager": actionResult,
        "DailyAlertPoster": alertResult
    }, null, 2);

    return new Response(json, {
        headers: { 'content-type': 'application/json' },
    });
}
