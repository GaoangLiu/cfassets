const [apiUrl, token] =
    [
        "https://post.ddot.cc/log?order=created_time.desc&limit=100",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjI4MjI4NjEsInJvbGUiOiJzbGlwcGVyIn0.rJR4NTdEw8sYk_zKReYSnqx5zV4fDCoKrhWyY7EPfI4"
    ];

async function* latestLog() {
    const response = await fetch(apiUrl, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const rows = await response.json();
    for (const row of rows) {
        // const curTime = new Date(row.created_time).getTime();
        // console.log(curTime, new Date().getTime());
        yield row;
        // if time diff is less than 30 seconds
        // if (new Date().getTime() - curTime < 30000) {
        //     yield row;
        // }
    }
}

async function main() {
    for await (const log of latestLog()) {
        console.log(log);
    }
}

module.exports = {
    latestLog
}
