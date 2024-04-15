const { latestLog } = require('./logdog.js');

class TimeDisplay {
    constructor() {
        this.time = new Date().toString().split(' ').slice(0, 5).join(' ');
        this.logs = [];
    }

    now() {
        return new Date().toString().split(' ').slice(0, 5).join(' ');
    }

    async newLogs() {
        const texts = []
        for await (const log of latestLog()) {
            const content = log.content
            if (!content.application || !content.source || !content.level) {
                continue;
            }
            const t = `${log.created_time} ${content.application} ${content.source} ${content.level}`;
            texts.push(t);
        }
        texts.sort();
        return texts;
    }

    async handle(request, env, ctx) {
        const HTML = `
        <html>
            <head>
                <title>Time and Logs</title>
                <style>
                    body {
                        height: 100vh;
                        margin: 0;
                        position: relative;
                        background-color: #f0f0f0;
                    }
                    #time {
                        font-size: 1.5rem;
                        color: #333;
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background-color: #fff;
                        border: 1px solid #333; /* add a border */
                        border-radius: 5px; /* round the corners */
                        padding: 3px; /* add some space between the text and the border */
                    }
                    #logWindow {
                        position: absolute;
                        width: 30%;
                        top: 50px; /* adjust this value as needed */
                        right: 10px;
                        height: 300px; /* adjust this value as needed */
                        overflow: auto;
                    }
                    pre {
                        font-family: 'Courier New', monospace;
                        background-color: #000;
                        color: #0F0;
                        padding: 10px;
                        border-radius: 5px;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        overflow: auto;
                    }
                    #table {
                        font-family: 'Courier New', monospace;
                        color: lightgreen;
                        background-color: #000;
                        padding: 10px;
                        width: 300px;
                        border-radius: 5px;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        overflow: auto;
                    }
                </style>
            </head>
            <body>
                <div id="time">${this.now()}</div>
                <div id="logWindow"></div>
                <div id="table">is streaming: true</div>
                <script>
                    async function fetchLogsAndUpdate() {
                        const response = await fetch('/api/ipinfo');
                        const log = await response.json();
                        const logWindow = document.getElementById('logWindow');
                        logWindow.innerHTML = '';
                        const logLine = document.createElement('pre');
                        logLine.textContent = JSON.stringify(log, null, 4);
                        logWindow.appendChild(logLine);
                        while (logWindow.childNodes.length > 20) {
                            logWindow.removeChild(logWindow.firstChild);
                        }
                    }

                    fetchLogsAndUpdate();
                    setInterval(fetchLogsAndUpdate, 60000);

                    setInterval(() => {
                        document.getElementById('time').innerText = new Date().toString().split(' ').slice(0, 5).join(' ');
                    }, 1000);
                </script>
            </body>
        </html>`;

        //  return html displaying time and logs, update every second
        return new Response(
            HTML, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

module.exports = { TimeDisplay };