
const { default: Root } = require('../controllers/root.js');
const Api = require('./../controllers/api.js');
const notFound = require('./../controllers/404.js');
const Database = require('./../models/db.js');
const Auth = require('./../middlewares/auth.js');

class Express {
    constructor() {
        this.routes = {};
    }

    add(route, controller, author = undefined) {
        this.routes[route] = { controller, author };
    }

    async validate(request, author) {
        return author.validate(request);
    }

    async handle(request) {
        const url = new URL(request.url);
        const path = url.pathname;

        for (const route in this.routes) {
            const v = this.routes[route];
            if (v.author) {
                if (!await this.validate(request, v.author)) {
                    return new Response(JSON.stringify({ "error": "Unauthorized" }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }

            if (path == route || path.startsWith(route + '/')) {
                console.log("Controller: " + v.controller.name)
                const controller = new v.controller();
                return await controller.handle(request);
            }
        }
        return notFound();
    }
}

module.exports = async function router(request) {
    let express = new Express();
    express.add('/', Root);
    express.add('/api', Api);
    express.add('/db', Database, new Auth());
    return await express.handle(request);
}
