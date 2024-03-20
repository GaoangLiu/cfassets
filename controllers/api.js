const notFound = require('./404.js');
const handlers = require('./../models/api.js');


class Api {
    constructor() {
        this.subroutes = {}
        for (const handler in handlers) {
            const obj = new handlers[handler]();
            const path = "/api/" + obj.subpath;
            this.subroutes[path] = obj;
            console.log("Adding path " + path + " for " + handler);

        }
        console.log(this.subroutes);
    }

    async handle(request) {
        const url = new URL(request.url);
        const path = url.pathname;
        for (const route in this.subroutes) {
            if (path === route || path.startsWith(route + '/')) {
                console.log("match" + route);
                const handler = this.subroutes[route];
                return new Response(JSON.stringify(await handler.handle(request), null, 2), {
                    headers: { 'content-type': 'application/json' },
                });
            }
        }
        return notFound();
    }
}


module.exports = Api;
