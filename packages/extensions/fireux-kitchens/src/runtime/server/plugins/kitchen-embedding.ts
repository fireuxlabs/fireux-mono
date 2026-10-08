import { defineNitroPlugin } from 'nitropack/runtime'
import { getResponseHeader } from 'h3'
import { embeddingResponseHeaders } from '../../kitchen/utils/embedding-response'

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:response', (response, { event }) => {
    const policy = event.context.kitchenFrameAncestors
    if (typeof policy !== 'string') return
    const current = getResponseHeader(event, 'Content-Security-Policy')
    response.headers = embeddingResponseHeaders(
      response.headers ?? {},
      policy,
      current
    )
  })
})
