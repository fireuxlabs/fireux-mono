import type { DocumentReference, Query } from 'firebase-admin/firestore'

export type LiveProjectionSource = DocumentReference | Query
export type LiveProjectionDependency = {
  source: LiveProjectionSource
  authority: boolean
}

export type LiveProjectionSources = {
  /** Declare the exact native document/query used by the projection or its authority. */
  watch: <T extends LiveProjectionSource>(
    source: T,
    options?: { authority?: boolean }
  ) => T
}

export function sameLiveProjectionSource(
  first: LiveProjectionSource,
  second: LiveProjectionSource
) {
  if (first.firestore !== second.firestore) return false
  if ('where' in first) return 'where' in second && first.isEqual(second)
  return !('where' in second) && first.isEqual(second)
}

/** Collect declarations without replacing the native Firestore read API. */
export function collectLiveProjectionSources() {
  const sources: LiveProjectionDependency[] = []
  let failure: Error | undefined
  const reject = (message: string): never => {
    failure ??= Object.assign(new Error(message), { statusCode: 500 })
    throw failure
  }
  return {
    sources,
    assertValid() {
      if (failure) throw failure
    },
    watch<T extends LiveProjectionSource>(
      source: T,
      options: { authority?: boolean } = {}
    ): T {
      if (failure) throw failure
      if (
        !source ||
        typeof source.onSnapshot !== 'function' ||
        typeof source.isEqual !== 'function' ||
        !source.firestore ||
        typeof source.firestore !== 'object'
      )
        reject('A live projection requires native Firestore sources.')
      let existing: LiveProjectionDependency | undefined
      try {
        existing = sources.find((current) =>
          sameLiveProjectionSource(current.source, source)
        )
      } catch {
        reject('The live projection source could not be validated.')
      }
      if (existing) existing.authority ||= options.authority === true
      else {
        if (sources.length >= 4096)
          reject('The live projection source budget was exceeded.')
        sources.push({ source, authority: options.authority === true })
      }
      return source
    },
  }
}

type Observer = { change: () => void; error: (cause: unknown) => void }
type SourceEntry = {
  source: LiveProjectionSource
  observers: Set<Observer>
  ready: Promise<void>
  resolve: () => void
  reject: (cause: unknown) => void
  unsubscribe?: () => void
  settled: boolean
  failed: boolean
}

/** Share native listeners only. No record payload or authorized DTO is cached here. */
export class LiveProjectionSourcePool {
  private entries = new Set<SourceEntry>()

  get size() {
    return this.entries.size
  }

  observe(source: LiveProjectionSource, observer: Observer) {
    let entry = [...this.entries].find(
      (candidate) =>
        !candidate.failed && sameLiveProjectionSource(candidate.source, source)
    )
    let start = false
    if (!entry) {
      let resolve!: () => void
      let reject!: (cause: unknown) => void
      const ready = new Promise<void>((yes, no) => {
        resolve = yes
        reject = no
      })
      // A terminal SDK error also reaches observers when no readiness waiter exists.
      void ready.catch(() => undefined)
      entry = {
        source,
        observers: new Set(),
        ready,
        resolve,
        reject,
        settled: false,
        failed: false,
      }
      this.entries.add(entry)
      start = true
    }
    const current = entry
    current.observers.add(observer)
    if (start) {
      try {
        current.unsubscribe = source.onSnapshot(
          () => {
            if (current.failed || !this.entries.has(current)) return
            if (!current.settled) {
              current.settled = true
              current.resolve()
            }
            for (const subscriber of [...current.observers]) subscriber.change()
          },
          (cause) => {
            current.failed = true
            if (!current.settled) {
              current.settled = true
              current.reject(cause)
            }
            queueMicrotask(() => {
              for (const subscriber of [...current.observers])
                subscriber.error(cause)
            })
          }
        )
      } catch (cause) {
        current.failed = true
        current.settled = true
        current.reject(cause)
        queueMicrotask(() => observer.error(cause))
      }
    }
    let active = true
    return {
      source,
      ready: current.ready,
      stop: () => {
        if (!active) return
        active = false
        current.observers.delete(observer)
        if (!current.observers.size) {
          this.entries.delete(current)
          current.unsubscribe?.()
          if (!current.settled) {
            current.settled = true
            current.resolve()
          }
        }
      },
    }
  }
}

export const liveProjectionSourcePool = new LiveProjectionSourcePool()
