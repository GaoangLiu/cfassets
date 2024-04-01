const params = {
    CHAR_GEN: "abcdefhijkmnprstwxyz2345678",
    NAME_REGEX: /^[a-zA-Z0-9+_\-\[\]*$:@,;\/]{3,}$/,
    RAND_LEN: 6,
    PRIVATE_RAND_LEN: 24,
    ADMIN_PATH_LEN: 24,
    SEP: ":",
    MAX_LEN: 25 * 1024 * 1024,
}

function decode(arrayBuffer) {
    return new TextDecoder().decode(arrayBuffer)
}

class WorkerError extends Error {
    constructor(statusCode, ...params) {
        super(...params)
        this.statusCode = statusCode
    }
}

function genRandStr(len) {
    // TODO: switch to Web Crypto random generator
    let str = ""
    const numOfRand = params.CHAR_GEN.length
    for (let i = 0; i < len; i++) {
        str += params.CHAR_GEN.charAt(Math.floor(Math.random() * numOfRand))
    }
    return str
}


function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json",
        },
        status,
    })
}


async function logMap(contentMap) {
    const message = contentMap.message || '';
    const level = contentMap.level || 'INFO';
    const application = contentMap.application || 'cf.worker.cudo.cc';
    const source = contentMap.source || 'CF-ALERT';
    const API = contentMap.api;
    if (!API) {
        throw new WorkerError(400, "API not provided")
    }

    return await fetch(
        API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer cflogging",
        },
        body: JSON.stringify({
            message,
            level,
            application,
            source,
        }),
    }
    )
}


module.exports = {
    WorkerError,
    genRandStr,
    decode,
    params,
    logMap,
}