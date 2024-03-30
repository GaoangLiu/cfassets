import { Client } from '@neondatabase/serverless';
const keys = require('./../config/keys.js');

class Database {
    constructor(env) {
        const databaseUrl = DATABASE_URL;
        this.client = new Client({ connectionString: databaseUrl });
        this.table = keys.db.TABLE_NAME;
    }

    async connect() {
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

export { Database };