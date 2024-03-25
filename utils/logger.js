const keys = require('../config/keys');

async function log(message,
    level = "INFO",
    application = "CF-ALERT",
    source = "cloudflare",
) {
    // 2024-03-25T02:16:50.639605
    const curTime = new Date().toISOString().replace(/Z$/, '123');
    const json = {
        "content": {
            "date": curTime,
            "level": level,
            "application": application,
            "source": source,
            "text": message,
        }, "created_time": curTime
    };
    try {
        const response = await fetch(keys.log.webhook, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + keys.log.token,
            },
            body: JSON.stringify(json),
        });
        return await response.text();
    } catch (error) {
        console.error('Error:', error);
        return { "error": "Error: " + error + " Please try again later." }
    }
}

module.exports = log;
