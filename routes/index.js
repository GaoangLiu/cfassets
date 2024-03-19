
const { default: Root } = require('../controllers/root.js');
const Api = require('./../controllers/api.js');
const notFound = require('./../controllers/404.js');

class Express {
    constructor() {
        this.routes = {};
    }
    add(route, controller) {
        this.routes[route] = controller;
    }
    async handle(request) {
        const url = new URL(request.url);
        const path = url.pathname;

        for (const route in this.routes) {
            if (path == route || path.startsWith(route + '/')) {
                const Controller = this.routes[route];
                const controller = new Controller();
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
    return await express.handle(request);
}
