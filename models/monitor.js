const { BarkMessager } = require('./bark');
const keys = require('../config/keys');

const {log} = require('./../utils/logger.js');

// enum class `streaming`, `not streaming`
const StreamStatus = {
    STREAMING: "YouTube channel is streaming",
    NOT_STREAMING: "YouTube channel is NOT streaming"
};


class YouTubeChannelMonitor {
    // 监控 YouTube 频道是否正在直播
    constructor(channelid, messager) {
        this.channelid = channelid;
        this.messager = messager;
    }

    async isChannelStreaming(attempts = 3) {
        if (attempts < 1) {
            return false;
        }
        try {
            let response = await fetch('https://www.youtube.com/@' + this.channelid + '/streams');
            let html = await response.text();
            if (html.includes("hqdefault_live.jpg")) {
                return true;
            }
        } catch (err) {
            await log('Error:' + err, "ERROR");
        }
        return this.isChannelStreaming(attempts - 1);
    }

    async notify(message, alert = true) {
        return await this.isChannelStreaming().then(async is_streaming => {
            console.log("is youtube channel streaming: " + is_streaming);
            if (!is_streaming) {
                if (alert) {
                    await this.messager.post(message);
                }
                return StreamStatus.NOT_STREAMING;
            } else {
                return StreamStatus.STREAMING;
            }
        });
    }
}

module.exports = async function channel_monitor(scheduled = false) {
    // check current time, run this evey 6 hours
    const messager = new BarkMessager();
    const channelId = keys.youtube.channelid;
    const monitor = new YouTubeChannelMonitor(channelId, messager);
    const message = "你的频道 " + channelId + " 直播已结束，请注意查看！";
    if (!scheduled) {
        return await monitor.notify(message, true);
    } else {
        if (new Date().getHours() % 6 === 0 && new Date().getMinutes() % 60 === 10) {
            return await monitor.notify(message, true);
        } else {
            return await monitor.notify(message, false);
        }
    }
}
