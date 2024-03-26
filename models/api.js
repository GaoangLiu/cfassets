const keys = require('../config/keys.js');
const log = require('./../utils/logger.js');

class IpinfoHandler {
    constructor(api = "https://ipinfo.io/json") {
        this.api = api;
        this.subpath = "ipinfo";
    }

    async handle(request) {
        try {
            const response = await fetch(this.api);
            const data = await response.json();
            return data;
        } catch (error) {
            await log('Error:' + error, "ERROR");
            return { "error": "Error: " + error + " Please try again later." }
        }
    }
}

class UuidHandler {
    constructor() {
        this.subpath = "uuid";
    }
    async handle(request) {
        return { "uuid": crypto.randomUUID() };
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

        return await response.json();
    }

    async handle(request) {
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
                return { "error": "Invalid request. Please provide 'text' or 'content' in the request." };
            }
        } catch (error) {
            await log('Error:' + error, "ERROR");
            return { "error": "An error occurred. Please try again later." };
        }
    }

    processResponse(data, text_only) {
        if (text_only) {
            return { "text": data["candidates"][0]["content"]["parts"][0]["text"] };
        }
        return data;
    }
}

module.exports = {
    IpinfoHandler,
    UuidHandler,
    GeminiHandler,
}
