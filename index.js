const router = require('./routes/index.js');
const scheduledTasks = require('./controllers/scheduled.js');

addEventListener('fetch', event => {
  event.respondWith(router(event.request))
})

addEventListener('scheduled', event => {
  event.waitUntil(
    scheduledTasks()
  )
})
