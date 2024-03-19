const keys = require('../config/keys');

class DockerRepoManager {
    // Remove old tags from docker hub
    constructor() {
        this.username = keys.docker.username;
        this.password = keys.docker.password;
        this.repo = 'pyserverless';
        this._token = null;
    }

    async token() {
        if (!this._token) {
            const response = await fetch('https://hub.docker.com/v2/users/login/', {
                method: 'POST',
                body: JSON.stringify({ username: this.username, password: this.password }),
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            this._token = data.token;
        }
        return this._token;
    }

    async getTags() {
        const response = await fetch(`https://hub.docker.com/v2/repositories/${this.username}/${this.repo}/tags/`);
        const data = await response.json();
        return data.results.map(result => result.name);
    }

    async removeTag(tag) {
        const token = await this.token();
        const response = await fetch(`https://hub.docker.com/v2/repositories/${this.username}/${this.repo}/tags/${tag}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const text = await response.text();
        console.log(`remove tag ${tag}`, text);
        return text;
    }

    async keepLatest() {
        const tags = await this.getTags();
        for (let i = 2; i < tags.length; i++) {
            await this.removeTag(tags[i]);
        }
        return tags;
    }
}

module.exports = async function action() {
    const manager = new DockerRepoManager();
    return await manager.keepLatest();
}