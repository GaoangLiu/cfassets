const keys = require('../config/keys.js');
const { log, logMap } = require('./../utils/logger.js');
const { isChannelStreaming } = require('./../models/monitor.js');

const hasValidHeader = (request, env) => {
    return request.headers.get('Authorization') === env.AUTHORIZATION;
};

function authorizeRequest(request, env) {
    switch (request.method) {
        case 'PUT':
        case 'DELETE':
            return hasValidHeader(request, env);
        default:
            return false;
    }
}

class IpinfoHandler {
    constructor(api = "https://ipinfo.io/json") {
        this.api = api;
        this.subpath = "ipinfo";
    }

    async handle(request, env, ctx) {
        try {
            const response = await fetch(this.api);
            const data = await response.json();
            return new Response(JSON.stringify(data, null, 2), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            await logMap({
                "message": `Error: ${error}`,
                "application": "cf.gateway.worker.Ipinfo",
                "level": "ERROR",
            })
            return new Response(JSON.stringify({ "error": "Error: " + error + " Please try again later." }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}

class UuidHandler {
    constructor() {
        this.subpath = "uuid";
    }
    async handle(request, env, ctx) {
        return new Response(JSON.stringify({
            "uuid": crypto.randomUUID()
        }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}


class YouTuBeStreamMonitor {
    constructor() {
        this.subpath = "youtube";
    }

    async handle(request, env, ctx) {
        const data = await request.json();
        const channelId = data.channelId;
        const isStreaming = await isChannelStreaming(channelId);
        return new Response(JSON.stringify({
            "channelId": channelId,
            "isStreaming": isStreaming
        }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

class GeminiHandler {
    constructor() {
        this.subpath = "gemini";
    }

    async prepareData(text) {
        return {
            "contents": [
                {
                    "parts": [
                        {
                            "text": text,
                        },
                    ],
                },
            ],
        };
    }

    async getResponse(inputData) {
        const key = keys.gemini.api_key;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${key}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(inputData),
        });

        return await response.json();
    }

    async handle(request, env, ctx) {
        try {
            const js = await request.json();
            const visitor_ip = request.headers.get("CF-Connecting-IP");
            if (js.contents) { // Chat with history
                await logMap({
                    "message": `Gemini input text: ${JSON.stringify(js.contents)}, visitor ip: ${visitor_ip}`,
                    "application": "cf.gateway.worker.Gemini",
                });
                const data = await this.getResponse(js);
                return this.processResponse(data, false);
            } else if (js.text) {
                await logMap({
                    "message": `Gemini input text: ${js.text} visitor ip: ${visitor_ip}`,
                    "application": "cf.gateway.worker.Gemini",
                });
                const inputData = await this.prepareData(js.text);
                const data = await this.getResponse(inputData);
                console.log(data);
                return this.processResponse(data, js.text_only);
            } else {
                return new Response(JSON.stringify({ "error": "Invalid request. Please provide 'text' or 'content' in the request." }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } catch (error) {
            await logMap({
                "message": `Gemini Error: ${error}`,
                "application": "cf.gateway.worker.Gemini",
                "level": "ERROR",
            });
            return new Response(JSON.stringify({ "error": "An error occurred. Please try again later." }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    processResponse(data, text_only) {
        console.log(JSON.stringify(data));
        if (text_only) {
            return new Response(JSON.stringify({
                "text":
                    data["candidates"][0]["content"]["parts"][0]["text"]
            }, null, 2), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return new Response(JSON.stringify(data, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

class ImageHandler {
    constructor() {
        this.subpath = "image";
        this.baseUrl = "https://image.ddot.cc";
    }

    async handle(request, env, ctx) {
        if (!authorizeRequest(request, env)) {
            return new Response(JSON.stringify({ "error": "Unauthorized" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const url = new URL(request.url);
        const key = url.pathname.replace('/api/image/', '');

        console.log(key);
        console.log(env.IMAGE_BUCKET);

        switch (request.method) {
            case 'PUT':
                const response = await env.IMAGE_BUCKET.put(key, request.body,
                    {
                        httpMetadata: {
                            contentType: request.headers.get('Content-Type', 'image/png'),
                        }
                    });
                const completeUrl = this.baseUrl + '/' + key;
                return new Response(JSON.stringify({
                    "url": completeUrl,
                    "r2 response": response
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            case 'GET':
                const object = await env.IMAGE_BUCKET.get(key);

                if (object === null) {
                    return new Response('Object Not Found', { status: 404 });
                }
                const headers = new Headers();
                object.writeHttpMetadata(headers);
                headers.set('etag', object.httpEtag);

                return new Response(object.body, {
                    headers,
                });
            case 'DELETE':
                await env.IMAGE_BUCKET.delete(key);
                return new Response('Deleted!');

            default:
                return new Response('Method Not Allowed', {
                    status: 405,
                    headers: {
                        Allow: 'PUT, GET, DELETE',
                    },
                });
        }
    }
}

module.exports = {
    IpinfoHandler,
    UuidHandler,
    GeminiHandler,
    ImageHandler,
    YouTuBeStreamMonitor,
}
