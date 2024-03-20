const { BarkMessager } = require('./bark');
const keys = require('../config/keys');


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

    async isChannelStreaming() {
        let attempts = 3;
        let ans = false;
        while (attempts > 0) {
            try {
                let response = await fetch('https://www.youtube.com/channel/' + this.channelid);
                let html = await response.text();
                ans = html.includes("hqdefault_live.jpg");
            } catch (err) {
                ans = false;
                console.warn('Something went wrong', err);
            }
            if (ans) {
                return true;
            } else {
                attempts--;
                if (attempts === 0) {
                    return false;
                }
            }
        }
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


module.exports = async function channel_monitor() {
    // check current time, run this evey 6 hours
    const messager = new BarkMessager();
    const channelId = keys.youtube.channelid;
    const monitor = new YouTubeChannelMonitor(channelId, messager);
    const message = "你的频道 " + channelId + " 直播已结束，请注意查看！";
    if (new Date().getHours() % 6 === 0 && new Date().getMinutes() % 60 === 1) {
        return await monitor.notify(message, true);
    } else {
        return await monitor.notify(message, false);
    }
}
