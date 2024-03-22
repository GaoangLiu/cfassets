const { BarkMessager } = require('./bark');

class Alert {
    constructor(message, time) {
        this.message = message;
        this.time = time;
    }

    async post() {
        const curTime = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Shanghai' }).slice(0, 5);
        if (curTime === this.time) {
            console.log("Posting alert: " + this.message);
            const messager = new BarkMessager();
            messager.setIcon("https://cdn.leonardo.ai/users/6c26bda9-509d-4bb3-b832-5d80bddcfa6d/generations/13f1ab61-cf57-4aec-9700-df8d637ac099/Default_Dog_in_nature_0.jpg?w=512")
            messager.post(this.message);
        } else {
            console.log('No alert at this time');
        }
    }
}

class AbstractPoster {
    constructor() {
        this.alerts = [];
    }

    addAlert(alert) {
        this.alerts.push(alert);
    }

    async postAlerts() {
        for (const alert of this.alerts) {
            await alert.post();
        }
    }
}

class DailyAlertPoster extends AbstractPoster {
    constructor() {
        super();
        this.api = "https://host.ddot.cc/tasks.json";
    }

    async loadAlerts() {
        try {
            const response = await fetch(this.api, {
                method: 'GET',
            });
            const data = await response.text();
            return Object.entries(JSON.parse(data)).
                map(([key, value]) => new Alert(key, value));
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    async handle() {
        const alerts = await this.loadAlerts();
        for (const alert of alerts) {
            this.addAlert(alert);
        }
        await this.postAlerts();
    }
}



module.exports = { DailyAlertPoster };
