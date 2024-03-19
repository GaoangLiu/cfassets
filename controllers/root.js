const action = require('./../models/actions.js');
const channel_monitor = require('./../models/monitor.js');
const keys = require('./../config/keys.js');

class Root {
    async handle(request) {
        const results = await Promise.all([{
            "name": "YouTubeChannelMontor",
            "value": await channel_monitor()
        }, {
            "name": "DockerRepoManager",
            "value": await action()
        }]);

        const generateHtml = (results) => {
            return results.map(result => {
                if (!result.name) {
                    return `<li>${result}</li>`;
                } else if (Array.isArray(result.value)) {
                    return `<li>${result.name}: <ul>${generateHtml(result.value)}</ul></li>`;
                } else {
                    return `<li>${result.name}: ${result.value}</li>`;
                }
            }).join('');
        };

        const api = keys.assets.host + "public/html/root.html";
        const htmlContent = await fetch(api).then(
            response => response.text()).then(
                text => text.replace("{{content}}", generateHtml(results)));

        return new Response(htmlContent, {
            headers: { 'content-type': 'text/html' },
        });


    }
}

export default Root;
