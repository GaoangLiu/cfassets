const log = require('./../utils/logger.js');

class Logging {
    constructor() {
        this.log = [];
    }
    async handle(request, env, ctx) {
        const inputs = await request.json();
        const {
            message,
            level = "INFO",
            application = "",
            source = ""
        } = inputs;
        if (!message) {
            return new Response(JSON.stringify({ "error": "Please provide all the required fields" }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const response = await log(message, level, application, source);
        return new Response(response, {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

module.exports = { Logging };
