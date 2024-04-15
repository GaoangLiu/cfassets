const { latestLog } = require('./logdog.js');

const CSS = `body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 70%;
    height: 100vh;
    margin: 0;
    position: absolute;
    background-color: #f0f0f0;
}

.youtube-icon {
    color: red;
}

.container {
    position: absolute;
    right: 10px;
    top: 10px;
    justify-content: right;
}

#time {
    font-size: 1.2rem;
    color: #333;
    border-radius: 5px; /* round the corners */
    padding: 3px; /* add some space between the text and the border */
}

#logWindow {
    overflow: auto;
    margin-top: 10px;
}

#statusList {
    margin-top: 20px; /* adjust this value as needed */
    font-size: 1.1rem;
    padding: 30px;
    width: 500px;
    border-radius: 5px;
    word-wrap: break-word;
    overflow-wrap: break-word;
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
}`;

const JS = `
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

async function updatingStreamingStatus() {
    const status = await fetch("/api/youtube", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ "channelId": "ultrasev"}),
    }).then((response) => response.json()).then((data) => data.isStreaming);

    const statusList = document.getElementById('statusList');
    const statusLine = document.createElement('li');
    const pText = '<i class="fab fa-youtube youtube-icon"></i> streaming status: ' + (status ? "<span style='color: green;'>STREAMING</span>" : "<span style='color: red;'>NOT STREAMING</span>");

    statusLine.innerHTML = pText; // Use innerHTML instead of textContent
    statusList.appendChild(statusLine);
}

fetchLogsAndUpdate();
updatingStreamingStatus();
setInterval(() => {
    fetchLogsAndUpdate;
    updatingStreamingStatus;
}, 60000);

setInterval(() => {
    document.getElementById('time').innerText = new Date().toString().split(' ').slice(0, 5).join(' ');
}, 1000);
`;

class TimeDisplay {
    constructor() {
        this.time = new Date().toString().split(' ').slice(0, 5).join(' ');
        this.logs = [];
    }

    now() {
        return new Date().toString().split(' ').slice(0, 5).join(' ');
    }


    async handle(request, env, ctx) {
        const url = new URL(request.url);
        switch (url.pathname) {
            case '/time/style.css':
                return new Response(CSS, {
                    headers: { 'Content-Type': 'text/css' }
                });
            case '/time/script.js':
                return new Response(JS, {
                    headers: { 'Content-Type': 'application/javascript' }
                });
            default:
                return this.renderHTML();
        }
    }

    renderHTML() {
        const HTML = `
        <html>
            <head>
                <title>Time and Logs</title>
                <link rel="stylesheet" href="time/style.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
           </head>
                <body>
                <div class="container">
                    <div id="time">${this.now()}</div>
                    <div id="logWindow"></div>
                    <ul id="statusList"></ul>
                </div>
                <script src="time/script.js"></script>
                </body>
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