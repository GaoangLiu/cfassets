const { DailyAlertPoster } = require('./../models/daily_alerts.js');

describe('DailyAlertPoster', () => {
    it('should create a DailyAlertPoster with a few alerts array', async () => {
        const poster = new DailyAlertPoster();
        // legnth greate than 0
        const alerts = await poster.loadAlerts();
        for (const alert of alerts) {
            poster.addAlert(alert);
        }
        expect(poster.alerts.length).toBeGreaterThan(0);
    });
});