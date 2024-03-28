const keys = require('../config/keys.js');
const log = require('./../utils/logger.js');


const hasValidHeader = (request, env) => {
    return request.headers.get('Authorization') === env.AUTHORIZATION;
};

function authorizeRequest(request, env, key) {
    switch (request.method) {
        case 'PUT':
        case 'DELETE':
            return hasValidHeader(request, env);
        case 'GET':
            return ALLOW_LIST.includes(key);
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
            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            await log('Error:' + error, "ERROR");
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
        }), {
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
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(inputData),
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async handle(request, env, ctx) {
        try {
            const js = await request.json();
            if (js.contents) { // Chat with history
                await log(`Gemini input text: ${JSON.stringify(js.contents)}`);
                const data = await this.getResponse(js);
                return this.processResponse(data, false);
            } else if (js.text) {
                await log(`Gemini input text: ${js.text}`);
                const inputData = await this.prepareData(js.text);
                const data = await this.getResponse(inputData);
                return this.processResponse(data, js.text_only);
            } else {
                return new Response(JSON.stringify({ "error": "Invalid request. Please provide 'text' or 'content' in the request." }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } catch (error) {
            await log('Error:' + error, "ERROR");
            return new Response(JSON.stringify({ "error": "An error occurred. Please try again later." }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    processResponse(data, text_only) {
        if (text_only) {
            return { "text": data["candidates"][0]["content"]["parts"][0]["text"] };
        }
        return data;
    }
}

class ImageHandler {
    constructor() {
        this.subpath = "image";
    }

    async handle(request, env, ctx) {
        const url = new URL(request.url);
        const key = url.pathname.replace('/api/image/', '');

        console.log(key);
        console.log(env.IMAGE_BUCKET);

        switch (request.method) {
            case 'PUT':
                const response = await env.IMAGE_BUCKET.put(key, request.body);
                console.log(response);
                return new Response('Put successfully!');
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
}
