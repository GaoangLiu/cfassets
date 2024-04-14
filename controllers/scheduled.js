const action = require('./../models/actions.js');
const { channel_monitor } = require('./../models/monitor.js');

module.exports = async function scheduledTasks() {
    const [monitorResult, actionResult, alertResult] = await
        Promise.all([
            channel_monitor(true),
            action()]);
    const json = JSON.stringify({
        "YouTubeChannelMontor": monitorResult,
        "DockerRepoManager": actionResult,
        "DailyAlertPoster": alertResult
    }, null, 2);

    return new Response(json, {
        headers: { 'content-type': 'application/json' },
    });
}
