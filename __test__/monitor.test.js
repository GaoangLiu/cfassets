const { YouTubeChannelMonitor } = require('./../models/monitor.js');
const { BarkMessager } = require('./../models/bark');

describe('YouTubeChannelMontor', () => {
    it('LofiGirl should be streaming', async () => {
        const messager = new BarkMessager();
        const monitor_lofi = new YouTubeChannelMonitor("LofiGirl", messager);
        let isAlive = await monitor_lofi.isChannelStreaming();
        expect(isAlive).toBe(true);
    });

    it('MrBeast should NOT be streaming', async () => {
        const messager = new BarkMessager();
        const monitor_lofi = new YouTubeChannelMonitor("MrBeast", messager);
        let isAlive = await monitor_lofi.isChannelStreaming();
        expect(isAlive).toBe(false);
    });

});