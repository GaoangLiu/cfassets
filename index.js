const router = require('./routes/index.js');
const scheduledTasks = require('./controllers/scheduled.js');


export default {
  async fetch(request, env, ctx) {
    return router(request, env, ctx)
  },

  async scheduled(event) {
    return scheduledTasks()
  }
}
