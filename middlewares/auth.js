
class AbstractAuth {
    constructor(request) {
        this.auth = null;
    }

    login() {
        throw new Error('login() must be implemented');
    }

    logout() {
        throw new Error('logout() must be implemented');
    }

    getUser() {
        throw new Error('getUser() must be implemented');
    }

    isAuthenticated() {
        throw new Error('isAuthenticated() must be implemented');
    }
}

class TokenAuth extends AbstractAuth {
    constructor(token) {
        super();
        this.tokens = {
            '110251cfbcee172a490558d61042cc96': 'user',
        };
        this.tokens[token] = '';
    }

    async validate(request) {
        const authorization = request.headers.get('Authorization');
        if (!authorization) {
            return false;
        }
        const token = authorization.split(' ')[1];
        if (token in this.tokens) {
            return true;
        }
        return false;
    }
}

module.exports = TokenAuth;
