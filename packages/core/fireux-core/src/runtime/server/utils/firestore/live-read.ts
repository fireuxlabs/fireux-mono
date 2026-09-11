import { AsyncLocalStorage } from 'node:async_hooks'
import type { Firestore } from 'firebase-admin/firestore'

type Source = {
  onSnapshot: (next: () => void, error: (error: unknown) => void) => () => void
  isEqual: (other: unknown) => boolean
}
type Collector = (source: Source) => void
const context = new AsyncLocalStorage<Collector>()

export function collectFirestoreReads<T>(
  collect: Collector,
  read: () => Promise<T>
) {
  return context.run(collect, read)
}

/** Preserve the Admin SDK receiver; observe only reads within an explicit live request. */
export function observeRuntimeFirestore(database: Firestore): Firestore {
  const collect = context.getStore()
  if (!collect) return database
  const cache = new WeakMap<object, object>()
  const chain = new Set([
    'collection',
    'collectionGroup',
    'doc',
    'where',
    'orderBy',
    'limit',
    'limitToLast',
    'offset',
    'select',
    'startAt',
    'startAfter',
    'endAt',
    'endBefore',
    'withConverter',
  ])
  const writes = new Set([
    'set',
    'update',
    'create',
    'delete',
    'add',
    'batch',
    'bulkWriter',
    'runTransaction',
    'recursiveDelete',
  ])
  const wrap = (target: any): any => {
    if (!target || typeof target !== 'object') return target
    if (Array.isArray(target)) return target.map(wrap)
    const cached = cache.get(target)
    if (cached) return cached
    const proxy = new Proxy(target, {
      get(object, property) {
        const value = Reflect.get(object, property, object)
        if (
          property === 'ref' ||
          property === 'parent' ||
          property === 'firestore'
        )
          return wrap(value)
        if (property === 'docs' && Array.isArray(value)) return value.map(wrap)
        if (
          property === 'get' &&
          typeof value === 'function' &&
          typeof object.onSnapshot === 'function'
        ) {
          return (...args: unknown[]) => {
            if (typeof object.onSnapshot === 'function') collect(object)
            return value.apply(object, args).then(wrap)
          }
        }
        if (property === 'getAll' && typeof value === 'function') {
          return (...args: any[]) => {
            for (const reference of args) {
              if (typeof reference?.onSnapshot === 'function')
                collect(reference)
            }
            return value.apply(object, args).then(wrap)
          }
        }
        if (typeof property === 'string' && writes.has(property)) {
          return () => {
            throw new Error('A live projection must not write to Firestore.')
          }
        }
        if (
          typeof property === 'string' &&
          chain.has(property) &&
          typeof value === 'function'
        ) {
          return (...args: unknown[]) => wrap(value.apply(object, args))
        }
        return typeof value === 'function' ? value.bind(object) : value
      },
    })
    cache.set(target, proxy)
    return proxy
  }
  return wrap(database)
}
