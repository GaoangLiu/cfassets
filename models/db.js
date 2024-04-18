const { Client } = require('@neondatabase/serverless');
const keys = require('./../config/keys.js');
const { genRandStr } = require('./../utils/common.js');

class Database {
    constructor(env) {
        const databaseUrl = keys.db.URL;
        this.client = new Client({ connectionString: databaseUrl });
        this.table = keys.db.TABLE_NAME;
        this._connected = false;
    }

    async connect() {
        if (this._connected) return;
        this._connected = true;
        console.log('connecting to database');
        await this.client.connect();
    }

    async query(sql) {
        return this.client.query(sql);
    }

    async end() {
        await this.client.end();
    }

    async fetch(sql) {
        await this.connect();
        const { rows } = await this.query(sql);
        await this.end();
        return new Response(JSON.stringify(rows), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async handle(request, env, ctx) {
        try {
            const js = await request.json();
            if (js.query) {
                return await this.fetch(js.query);
            }
            return new Response(JSON.stringify({ "error": "Please provide a query in the request body" }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Error:', error);
            return new Response(JSON.stringify({ "error": "something went wrong, please try again later." }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}


class Pastebin extends Database {
    constructor(env) {
        super(env);
        this.table = keys.db.TABLE_NAME;
    }

    async get(key) {
        await this.connect();
        const sql = `SELECT * FROM ${this.table} WHERE key = '${key}'`;
        const { rows } = await this.query(sql);
        if (rows.length === 0) {
            return null;
        } else {
            const content = rows[0].content;
            if (content.value) {
                return content.value;
            } else {
                return content;
            }
        }
    }
    async handleGet(request) {
        const url = new URL(request.url)
        const key = url.searchParams.get('key');
        if (key) {
            const content = await this.get(key);
            return new Response(content, {
                headers: { 'Content-Type': 'text/plain' }
            });
        } else {
            return new Response(JSON.stringify({ "error": "Please provide a key in the query string" }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async handlePost(request) {
        try {
            const js = await request.json();
            const key = js.key ? js.key : genRandStr(8);
            if (await this.get(key)) {
                const sql = `DELETE FROM ${this.table} WHERE key = '${key}'`;
                await this.query(sql);
            } else {
                const content = JSON.stringify({ "value": js.value, })
                const sql = `INSERT INTO ${this.table} (key, content) VALUES ('${key}', '${content}')`;
                await this.query(sql);
                return new Response(JSON.stringify({
                    "message": "success", "url":
                        keys.configs.host + "/pb?key=" + key
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } catch (error) {
            console.error('Error:', error);
            return new Response(JSON.stringify({ "error": "something went wrong, please try again later." }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async handle(request, env, ctx) {
        await this.connect();
        const method = request.method;
        switch (method) {
            case 'GET':
                return await this.handleGet(request);
            case 'POST':
                return await this.handlePost(request);
            default:
                return new Response(JSON.stringify({ "error": "Method not allowed" }), {
                    headers: { 'Content-Type': 'application/json' }
                });
        }
    }
}

module.exports = {
    Database,
    Pastebin
};
