import { AsyncLocalStorage } from 'node:async_hooks'
import { createHash } from 'node:crypto'
import { defineEventHandler, setResponseHeader, type H3Event } from 'h3'
import {
  API_READ_ACCESS_HEADER,
  API_READ_VERSION_HEADER,
  apiReadUrl,
  type ApiReadAccess,
} from '../../utils/api-read-protocol'
import {
  collectLiveProjectionSources,
  type LiveProjectionDependency,
  type LiveProjectionSources,
} from './live-projection-sources'

export type LiveProjectionEvaluation = {
  version: string
  sources: LiveProjectionDependency[]
}

export class LiveProjectionReadError extends Error {
  readonly reason: unknown
  readonly sources: LiveProjectionDependency[]
  constructor(reason: unknown, sources: LiveProjectionDependency[]) {
    super('The live projection could not be read.')
    this.reason = reason
    this.sources = sources
  }
}

export type CapturedLiveProjection = {
  access: ApiReadAccess
  initial?: LiveProjectionEvaluation
  initialError?: LiveProjectionReadError
  read: () => Promise<LiveProjectionEvaluation>
}

type ProjectionCapture = {
  url: string
  accept: (projection: CapturedLiveProjection) => void
}
const captures = new AsyncLocalStorage<ProjectionCapture>()

export function liveProjectionVersion(value: unknown) {
  const json = JSON.stringify(value, (_key, item: unknown) => {
    if (item && typeof item === 'object' && !Array.isArray(item))
      return Object.fromEntries(
        Object.entries(item).sort(([first], [second]) =>
          first.localeCompare(second)
        )
      )
    return item
  })
  if (json === undefined)
    throw new Error('A live projection must return a JSON DTO.')
  return createHash('sha256').update(json).digest('hex')
}

/** Domain authority and the returned DTO remain identical for normal and live reads. */
export function defineLiveProjection<T>(definition: {
  access: ApiReadAccess | ((event: H3Event) => ApiReadAccess)
  read: (event: H3Event, sources: LiveProjectionSources) => Promise<T> | T
}) {
  return defineEventHandler(async (event) => {
    const access =
      typeof definition.access === 'function'
        ? definition.access(event)
        : definition.access
    if (access !== 'public' && access !== 'protected')
      throw new Error('A live projection must declare its access scope.')
    setResponseHeader(event, 'Cache-Control', 'no-store')
    setResponseHeader(event, API_READ_ACCESS_HEADER, access)
    const evaluate = async () => {
      const sources = collectLiveProjectionSources()
      let value: T
      try {
        value = await definition.read(event, sources)
      } catch (cause) {
        sources.assertValid()
        throw new LiveProjectionReadError(cause, sources.sources)
      }
      sources.assertValid()
      if (!sources.sources.length)
        throw new Error(
          'A live projection must declare at least one native source.'
        )
      return {
        value,
        version: liveProjectionVersion(value),
        sources: sources.sources,
      }
    }
    const projection: CapturedLiveProjection = {
      access,
      read: async () => {
        const next = await evaluate()
        return { version: next.version, sources: next.sources }
      },
    }
    const capture = captures.getStore()
    if (capture && apiReadUrl(event.path) === capture.url)
      capture.accept(projection)
    let result: Awaited<ReturnType<typeof evaluate>>
    try {
      result = await evaluate()
      projection.initial = { version: result.version, sources: result.sources }
    } catch (cause) {
      if (cause instanceof LiveProjectionReadError) {
        projection.initialError = cause
        throw cause.reason
      }
      throw cause
    }
    setResponseHeader(event, API_READ_VERSION_HEADER, result.version)
    return result.value
  })
}

/** The capture capability exists only during an in-process dispatch, never in HTTP input. */
export async function captureLiveProjection(
  url: string,
  dispatch: () => Promise<unknown>
) {
  const requestUrl = apiReadUrl(url)
  async function invoke() {
    const holder: { value?: CapturedLiveProjection } = {}
    try {
      await captures.run(
        {
          url: requestUrl,
          accept: (projection) => {
            holder.value = projection
          },
        },
        dispatch
      )
    } catch (cause) {
      if (!holder.value?.initialError) throw cause
    }
    if (!holder.value)
      throw Object.assign(
        new Error('This API does not declare a live projection.'),
        { statusCode: 400 }
      )
    return holder.value
  }
  const projection = await invoke()
  return {
    ...projection,
    read: async () => {
      // Re-enter native routing/middleware with a fresh H3 event on every change.
      const current = await invoke()
      if (current.initialError) throw current.initialError
      return current.initial!
    },
  }
}
