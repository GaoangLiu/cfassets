const { BarkMessager } = require('./bark');
const keys = require('../config/keys');

const { log } = require('./../utils/logger.js');

// enum class `streaming`, `not streaming`
const StreamStatus = {
    STREAMING: "YouTube channel is streaming",
    NOT_STREAMING: "YouTube channel is NOT streaming"
};

async function isChannelStreaming(channelId, attempts = 10) {
    if (attempts < 1) {
        return false;
    }
    try {
        const b = await fetch(
            'https://cf.ddot.cc/api/youtube?channel_id=' + channelId, {
            method: 'POST',
        }).then(res => res.json()).then(data => { return data.is_live; });
        if (b) {
            return true;
        }
    } catch (err) {
        await log('Error:' + err, "ERROR");
    }
    return isChannelStreaming(channelId, attempts - 1);
}

class YouTubeChannelMonitor {
    // 监控 YouTube 频道是否正在直播
    constructor(channelid, messager) {
        this.channelid = channelid;
        this.messager = messager;
    }

    async isChannelStreaming(attempts = 3) {
        return await isChannelStreaming(this.channelid, attempts);
    }

    async notify(message, alert = true) {
        return await this.isChannelStreaming().then(async is_streaming => {
            console.log("is youtube channel streaming: " + is_streaming);
            if (!is_streaming) {
                if (alert) {
                    const response = await this.messager.post(message);
                    console.log(response);
                }
                return StreamStatus.NOT_STREAMING;
            } else {
                return StreamStatus.STREAMING;
            }
        });
    }
}

async function channel_monitor(scheduled = false) {
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

module.exports = {
    YouTubeChannelMonitor,
    channel_monitor,
    isChannelStreaming,
}
