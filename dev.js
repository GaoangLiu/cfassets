const { DailyAlertPoster } = require('./models/daily_alerts.js');

async function main() {
    const poster = new DailyAlertPoster();
    const alerts = await poster.loadAlerts();
    console.log(alerts);
    console.log(alerts.length);
    await poster.handle();
}

main();
const curTime = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Shanghai' }).slice(0, 5);
console.log(
    curTime==="11:52"
)