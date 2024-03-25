const { DailyAlertPoster } = require('./models/daily_alerts.js');

const log = require('./utils/logger.js');
async function main() {
    const poster = new DailyAlertPoster();
    const alerts = await poster.loadAlerts();
    console.log(alerts);
    console.log(alerts.length);
    await poster.handle();
}

main();
// log(
//     "This is a test message"
// )