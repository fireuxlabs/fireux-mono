import { feeds, installMetrics, recordRequest } from '../utils/metrics'

export default defineNitroPlugin((nitro) => {
  installMetrics()
  nitro.hooks.hook('request', (event) => {
    if (event.path.startsWith('/api/__fixture/metrics')) return
    if (!event.path.startsWith('/api/')) return
    recordRequest(event.path)
    if (event.path === '/api/live') {
      feeds.add(event.node.res)
      event.node.res.once('close', () => feeds.delete(event.node.res))
    }
  })
})
