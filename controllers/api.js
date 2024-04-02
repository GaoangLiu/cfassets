const notFound = require('./404.js');
const handlers = require('./../models/api.js');
const { log, logMap } = require('./../utils/logger.js');

class Api {
    constructor() {
        this.subroutes = {}
        for (const handler in handlers) {
            const obj = new handlers[handler]();
            const path = "/api/" + obj.subpath;
            this.subroutes[path] = obj;
        }
    }

    async addLog(request) {
        const url = new URL(request.url);
        const path = url.pathname;
        const msg = {
            "ip": request.headers.get("CF-Connecting-IP"),
            "path": path,
            "method": request.method,
            "headers": Object.fromEntries([...request.headers.entries()]),
        }
        await logMap({
            "message": JSON.stringify(msg, null, 2),
            "level": "INFO",
            "application": "cf.worker.api",
            "source": "CF-ALERT"
        });
    }

    async handle(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        await this.addLog(request);
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
