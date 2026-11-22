import { useRuntimeConfig } from '#imports'
import { defineEventHandler, getQuery, getRequestURL, setHeader } from 'h3'
import {
  buildAppManifest,
  readManifestStartUrl,
} from 'fireux-core/runtime/app/server/manifest'

export default defineEventHandler((event) => {
  const fireux = useRuntimeConfig(event).public?.fireux
  const startUrl = readManifestStartUrl(getQuery(event).start_url)
  const requestOrigin = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true,
  }).origin
  const allowed =
    Array.isArray(fireux?.workspaces) &&
    fireux.workspaces.some((family) => {
      if (typeof family !== 'string' || !/^[a-z][a-z0-9-]*$/.test(family))
        return false
      const origin = fireux.workspaceConfig?.[family]?.origin
      return origin
        ? origin === requestOrigin && startUrl === '/'
        : startUrl === `/workspace/${family}`
    })

  setHeader(event, 'content-type', 'application/manifest+json')
  return allowed
    ? buildAppManifest(startUrl, ' Workspace')
    : buildAppManifest('/')
})
