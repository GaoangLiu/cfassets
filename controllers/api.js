const notFound = require('./404.js');
const handlers = require('./../models/api.js');
const { log } = require('./../utils/logger.js');

class Api {
    constructor() {
        this.subroutes = {}
        for (const handler in handlers) {
            const obj = new handlers[handler]();
            const path = "/api/" + obj.subpath;
            this.subroutes[path] = obj;
            log("Adding path " + path + " for " + handler);
        }
        log("Subroutes" + this.subroutes);
    }

    async handle(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        for (const route in this.subroutes) {
            if (path === route || path.startsWith(route + '/')) {
                await log("match" + route);
                const handler = this.subroutes[route];
                return await handler.handle(request, env, ctx);
            }
        }
        return notFound();
    }
}


module.exports = Api;
