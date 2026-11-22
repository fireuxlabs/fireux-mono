import { defineEventHandler, getQuery, setHeader } from 'h3'
import { buildAppManifest, readManifestStartUrl } from '../app/server/manifest'

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/manifest+json')
  return buildAppManifest(readManifestStartUrl(getQuery(event).start_url))
})
