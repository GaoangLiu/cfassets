const { log, logMap } = require('./../utils/logger.js');

class Whisper {
    constructor() {
        this.message = 'Hello from Whisper!';
    }

    async handle(request, env, ctx) {
        const server = "https://whisper.ddot.cc/v1";
        const url = new URL(request.url);
        const path = url.pathname.replace('/whisper', '');
        const msg = {
            "ip": request.headers.get("CF-Connecting-IP"),
            "path": path,
            "method": request.method,
            "headers": Object.fromEntries([...request.headers.entries()]),
        };
        await logMap({
            "message": JSON.stringify(msg, null, 2),
            "level": "INFO",
            "application": "api.ddot.cc/whisper",
            "source": "CF-ALERT"
        });
        const headers = new Headers(request.headers);
        headers.delete('accept-encoding');
        try {
            return await fetch(server + path, {
                method: request.method,
                headers: headers,
                body: request.body
            });
        } catch (error) {
            console.error('Error fetching the server:', error);
            return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 500 });
        }
    }
}

module.exports = { Whisper };
