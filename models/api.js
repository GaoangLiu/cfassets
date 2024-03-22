const keys = require('../config/keys.js');

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
            console.error('Error:', error);
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
    async getResponse(text) {
        const key = keys.gemini.api_key;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`;

        const inputData = {
            contents: [{
                parts: [{
                    text: text,
                },],
            },],
        };

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
            const { text, text_only } = await request.json();
            if (!text) {
                return { "error": "Please provide text in the request body" };
            }
            console.log(`Gemini input text: ${text}`);
            const data = await this.getResponse(text);
            return this.processResponse(data, text_only);
        } catch (error) {
            console.error('Error:', error);
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
