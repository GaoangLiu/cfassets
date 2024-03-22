const keys = require('../config/keys');

class BarkMessager {
    constructor() {
        this.barkAPI = keys.bark.host;
        this.icon = keys.assets.host + "/assets/images/monkey-logo.png";
        this.token = keys.bark.token;
        this.group = "CF-ALERT";
        this.title = "CF-ALERT";
    }

    // add setter for icon, title
    setIcon(icon) {
        this.icon = icon;
    }

    setTitle(title) {
        this.title = title;
    }

    async post(message) {
        const bartAPI = this.barkAPI + encodeURIComponent(message) +
            "?group=" + this.group + "&icon=" + this.icon + "&token=" + this.token;
        await fetch(bartAPI).then(function (response) {
            console.log(response);
        }).catch(function (err) {
            console.warn('Something went wrong', err);
        });
    }
}


module.exports = {
    BarkMessager
}