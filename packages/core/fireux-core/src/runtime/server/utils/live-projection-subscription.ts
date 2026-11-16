import type { ApiReadEvent } from '../../utils/api-read-protocol'
import {
  LiveProjectionReadError,
  type CapturedLiveProjection,
} from './live-projection'
import {
  liveProjectionSourcePool,
  sameLiveProjectionSource,
  type LiveProjectionDependency,
  type LiveProjectionSourcePool,
} from './live-projection-sources'

type Observation = ReturnType<LiveProjectionSourcePool['observe']> & {
  authority: boolean
}

export function liveProjectionFailure(cause: unknown) {
  const error = cause instanceof LiveProjectionReadError ? cause.reason : cause
  const value =
    error && typeof error === 'object'
      ? (error as { statusCode?: unknown; status?: unknown })
      : {}
  const candidate = Number(value.statusCode ?? value.status)
  const statusCode =
    Number.isInteger(candidate) && candidate >= 400 && candidate <= 599
      ? candidate
      : 503
  return {
    statusCode,
    message:
      statusCode === 401
        ? 'Sign in to continue this live read.'
        : statusCode === 403
          ? 'Access to this record is no longer available.'
          : statusCode === 404
            ? 'This record is not currently available.'
            : statusCode === 400
              ? 'This API does not support the requested live read.'
              : 'Live data is temporarily unavailable.',
    retryable: statusCode >= 500 || statusCode === 429,
  }
}

/** One server-owned projection; source payloads never leave the native listener. */
export function subscribeLiveProjection(options: {
  id: string
  version: string
  projection: CapturedLiveProjection
  send: (event: ApiReadEvent) => void
  pool?: LiveProjectionSourcePool
}) {
  const pool = options.pool ?? liveProjectionSourcePool
  let observations: Observation[] = []
  let stopped = false,
    running = false,
    dirty = false,
    ready = false
  let lastVersion = options.version,
    lastError = ''
  let timer: ReturnType<typeof setTimeout> | undefined

  function stop() {
    if (stopped) return
    stopped = true
    clearTimeout(timer)
    for (const observation of observations) observation.stop()
    observations = []
  }

  function sendFailure(cause: unknown) {
    if (stopped) return
    const failure = liveProjectionFailure(cause)
    const key = `${failure.statusCode}:${failure.message}`
    if (key !== lastError)
      options.send({ type: 'error', id: options.id, ...failure })
    lastError = key
    if (failure.statusCode !== 403 && failure.statusCode !== 404) stop()
  }

  function invalidate() {
    if (stopped) return
    dirty = true
    if (!running && !timer)
      timer = setTimeout(() => {
        timer = undefined
        void run()
      }, 25)
  }

  async function install(dependencies: LiveProjectionDependency[]) {
    if (stopped) return false
    const next: Observation[] = [],
      added: Observation[] = []
    for (const dependency of dependencies) {
      let observation = observations.find((candidate) =>
        sameLiveProjectionSource(candidate.source, dependency.source)
      )
      if (!observation) {
        observation = {
          ...pool.observe(dependency.source, {
            change: invalidate,
            error: () => sendFailure({ statusCode: 503 }),
          }),
          authority: dependency.authority,
        }
        added.push(observation)
      }
      observation.authority = dependency.authority
      next.push(observation)
    }
    // Keep old sources installed until new join and authority sources are ready.
    observations = [...observations, ...added]
    await Promise.all(added.map((observation) => observation.ready))
    if (stopped) return false
    for (const previous of observations)
      if (!next.includes(previous)) previous.stop()
    observations = next
    return added.length > 0
  }

  async function deny(cause: LiveProjectionReadError) {
    const failure = liveProjectionFailure(cause)
    if (failure.statusCode !== 403 && failure.statusCode !== 404) {
      sendFailure(cause)
      return
    }
    const authority = cause.sources.filter((dependency) => dependency.authority)
    if (!authority.length) {
      sendFailure(cause)
      stop()
      return
    }
    await install(authority)
    sendFailure(cause)
  }

  async function run() {
    if (stopped || running) return
    running = true
    try {
      let passes = 0
      do {
        dirty = false
        try {
          const result = await options.projection.read()
          if (stopped) return
          const added = await install(result.sources)
          if (stopped) return
          if (added) {
            dirty = true
            continue
          }
          const recovered = Boolean(lastError)
          lastError = ''
          if (!ready || recovered) {
            ready = true
            options.send({
              type: 'ready',
              id: options.id,
              version: result.version,
            })
          } else if (lastVersion !== result.version)
            options.send({
              type: 'change',
              id: options.id,
              version: result.version,
            })
          lastVersion = result.version
        } catch (cause) {
          if (cause instanceof LiveProjectionReadError) await deny(cause)
          else if ([403, 404].includes(liveProjectionFailure(cause).statusCode))
            await deny(
              new LiveProjectionReadError(
                cause,
                observations.map(({ source, authority }) => ({
                  source,
                  authority,
                }))
              )
            )
          else sendFailure(cause)
        }
      } while (!stopped && dirty && ++passes < 8)
    } finally {
      running = false
      if (!stopped && dirty) invalidate()
    }
  }

  const started = (async () => {
    running = true
    try {
      if (options.projection.initial)
        await install(options.projection.initial.sources)
      else if (options.projection.initialError)
        await install(
          options.projection.initialError.sources.filter(
            (source) => source.authority
          )
        )
    } catch (cause) {
      sendFailure(cause)
    } finally {
      running = false
    }
    // Reread after initial snapshot readiness, closing the GET-to-subscription gap.
    await run()
  })()
  return { stop, ready: started }
}
