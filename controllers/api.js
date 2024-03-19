const notFound = require('./404.js');

class Api {
    constructor() {
        this.url = 'https://ipinfo.io/json';
    }

    async ipinfo() {
        try {
            const response = await fetch(this.url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            return { "error": "Error: " + error + " Please try again later." }
        }
    }

    async uuid() {
        return { "uuid": crypto.randomUUID() };
    }

    async handle(request) {
        // if api/ipinfo, return the ipinfo
        console.log(request.url);
        const url = new URL(request.url);
        const path = url.pathname;
        console.log(path);
        const routes = {
            '/api/ipinfo': this.ipinfo,
            '/api/uuid': this.uuid,
        };
        for (const route in routes) {
            if (path.startsWith(route)) {
                const handler = routes[route].bind(this);
                return new Response(JSON.stringify(await handler(), null, 2), {
                    headers: { 'content-type': 'application/json' },
                });
            }
        }
        return notFound();
    }
}

module.exports = Api;
