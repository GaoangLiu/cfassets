const { default: Root } = require('../controllers/root.js');
const Api = require('./../controllers/api.js');
const notFound = require('./../controllers/404.js');
const { Database, Pastebin } = require('./../models/db.js');
const { Logging } = require('./../models/logging.js');
const Auth = require('./../middlewares/auth.js');
const { Whisper } = require('./../models/public.js');

class Express {
    constructor(items = []) {
        this.routes = {};
        for (const i of items) {
            this.routes[i[0]] = { controller: i[1], author: i[2] };
        }
    }

    add(route, controller, author = undefined) {
        this.routes[route] = { controller, author };
    }

    async validate(request, author) {
        return author.validate(request);
    }

    async handle(request, env, ctx) {
        console.log(this.routes)
        const url = new URL(request.url);
        const path = url.pathname;

        for (const route in this.routes) {
            const v = this.routes[route];
            if (path == route || path.startsWith(route + '/')) {
                if (v.author) {
                    if (!await this.validate(request, v.author)) {
                        return new Response(JSON.stringify({ "error": "Unauthorized" }), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }
                console.log("Controller: " + v.controller.name)
                const controller = new v.controller();
                return await controller.handle(request, env, ctx);
            }
        }
        return notFound();
    }
}

const { TimeDisplay } = require('./../models/demo');
module.exports = async function router(request, env, ctx) {
    const routes = [
        ['/', Root],
        ['/api', Api],
        ['/db', Database, new Auth()],
        ['/pb', Pastebin], // pastebin api route
        ['/logging', Logging, new Auth("cflogging")], // logging api route
        ['/time', TimeDisplay],
        ['/whisper', Whisper]
    ]
    return await new Express(routes).handle(request, env, ctx);
}
