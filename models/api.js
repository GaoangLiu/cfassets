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
    async handle(request) {
        let text;
        try {
            const requestBody = await request.json();
            text = requestBody.text;
            if (!text) {
                return { "error": "Please provide text in the request body" };
            }
            console.log("Gemini input text: " + text);
        } catch (error) {
            console.error('Error:', error);
            return { "error": "Error: " + error + " Please try again later." }
        }

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

        const data = await response.json();
        return data;
    }
}

module.exports = {
    IpinfoHandler,
    UuidHandler,
    GeminiHandler,
}
