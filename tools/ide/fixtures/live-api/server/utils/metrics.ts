import { AsyncLocalStorage } from 'node:async_hooks'
import { DocumentReference, Firestore, Query } from 'firebase-admin/firestore'
import { liveProjectionSourcePool } from 'fireux-core/runtime/server/utils/live-projection-sources'

export function assertFixture() {
  if (
    process.env.FIREUX_LIVE_FIXTURE !== 'demo-fireux-live' ||
    process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8181' ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9199'
  )
    throw new Error(
      'This route requires the isolated fixture emulator environment.'
    )
}

type Counts = { calls: number; documents: number }
const phase = new AsyncLocalStorage<'comparison'>()
const counts: Record<string, Counts> = {}
const requests: Record<string, number> = {}
const active = new Map<object, { database: string; type: string }>()
export const feeds = new Set<{ destroy: () => void }>()

function count(kind: string, documents = 0) {
  const key = `${phase.getStore() || 'ordinary'}:${kind}`
  const entry = (counts[key] ||= { calls: 0, documents: 0 })
  entry.calls++
  entry.documents += documents
}

export function recordRequest(path: string) {
  const key = `${phase.getStore() || 'ordinary'}:${path}`
  requests[key] = (requests[key] || 0) + 1
}

export function resetMetrics() {
  for (const key of Object.keys(counts)) delete counts[key]
  for (const key of Object.keys(requests)) delete requests[key]
}

export function snapshotMetrics() {
  const listeners = [...active.values()]
  return {
    counts,
    requests,
    activeFeeds: feeds.size,
    pooledSources: liveProjectionSourcePool.size,
    activeListeners: listeners.length,
    listenersByDatabase: Object.fromEntries(
      ['misebox', 'fireux', 'live-identity'].map((database) => [
        database,
        listeners.filter((item) => item.database === database).length,
      ])
    ),
    note: 'Logical SDK calls and returned documents, not a Firebase billing estimate. Native browser listeners are outside these Admin counters.',
  }
}

/** Fixture-only observation of native SDK calls; production readers are unchanged. */
export function installMetrics() {
  assertFixture()
  const queryGet = Query.prototype.get
  Query.prototype.get = async function (...args: Parameters<typeof queryGet>) {
    const result = await queryGet.apply(this, args)
    count('queryGet', result.size)
    return result
  }
  const getAll = Firestore.prototype.getAll
  Firestore.prototype.getAll = async function (
    ...args: Parameters<typeof getAll>
  ) {
    const result = await getAll.apply(this, args)
    count('getAll', result.filter((item) => item.exists).length)
    count('getAllTargets', result.length)
    return result
  }
  for (const [type, prototype] of [
    ['query', Query.prototype],
    ['document', DocumentReference.prototype],
  ] as const) {
    const onSnapshot = prototype.onSnapshot
    ;(prototype as any).onSnapshot = function (...args: any[]) {
      const key = {}
      const database = this.firestore.databaseId
      active.set(key, { database, type })
      count('listenerInstall')
      const callback = args.findIndex((item) => typeof item === 'function')
      const original = args[callback]
      args[callback] = (...values: any[]) => {
        const snapshot = values[0]
        count(
          'listenerSnapshot',
          typeof snapshot.size === 'number'
            ? snapshot.size
            : Number(snapshot.exists)
        )
        return original(...values)
      }
      let stop: () => void
      try {
        stop = (onSnapshot as (...values: any[]) => () => void).apply(
          this,
          args
        )
      } catch (cause) {
        active.delete(key)
        throw cause
      }
      return () => {
        if (active.delete(key)) count('listenerStop')
        stop()
      }
    }
  }
  const fetcher = globalThis.$fetch
  const raw = fetcher.raw.bind(fetcher)
  fetcher.raw = ((...args: Parameters<typeof raw>) =>
    phase.run('comparison', () => {
      count('projectionDispatch')
      return raw(...args)
    })) as typeof fetcher.raw
}
