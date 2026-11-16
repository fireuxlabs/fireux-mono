import {
  createError,
  clearNuxtData,
  useAsyncData,
  useNuxtApp,
  useRuntimeConfig,
  useState,
  type AsyncDataOptions,
  type NuxtApp,
} from 'nuxt/app'
import {
  computed,
  getCurrentInstance,
  onActivated,
  onDeactivated,
  onMounted,
  onScopeDispose,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import { useAuth } from '../fireux/firebase/useAuth'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import {
  API_READ_ACCESS_HEADER,
  API_READ_VERSION_HEADER,
  apiReadUrl,
  apiReadVersion,
  type ApiReadAccess,
} from '../../utils/api-read-protocol'
import {
  createApiReadConnections,
  type ApiReadConnections,
  type ApiReadFailure,
} from './api-read-connections'
import {
  createApiReadRequests,
  type ApiReadRequests,
} from './api-read-requests'

type ReadDescriptor = {
  url: string
  version: string
  access: ApiReadAccess
  language?: string
}
type NativeState = {
  pending: Ref<boolean>
  error: Ref<unknown>
  status: Ref<'idle' | 'pending' | 'success' | 'error'>
  clear: () => void
  refresh: (options?: { dedupe?: 'defer' | 'cancel' }) => Promise<unknown>
}
type Participant = { key: () => string; state?: NativeState; active: boolean }
type Handle = ReturnType<ApiReadConnections['subscribe']>
type ReadOwner = {
  key: string
  epoch: number
  notification: number
  satisfied: number
  wanted: Map<string, string>
  requests: ApiReadRequests
  protected: boolean
  participants: Set<Participant>
  descriptors: Map<string, ReadDescriptor>
  handles: Map<string, Handle>
  scheduled: boolean
  refreshing: boolean
}
type AppReaders = {
  owners: Map<string, ReadOwner>
  connections?: ApiReadConnections
}
const applications = new WeakMap<NuxtApp, AppReaders>()

function descriptorKey(value: ReadDescriptor) {
  return `${value.url}|${value.language || ''}`
}
function currentParticipant(owner: ReadOwner) {
  return [...owner.participants].find(
    (item) => item.active && item.key() === owner.key && item.state
  )
}
function stopHandles(owner: ReadOwner) {
  for (const handle of owner.handles.values()) handle.stop()
  owner.handles.clear()
}

/** Shared keyed refresh coordination also covers two components using one Nuxt key. */
function refreshOwner(owner: ReadOwner) {
  if (owner.scheduled || owner.refreshing || !currentParticipant(owner)) return
  owner.scheduled = true
  queueMicrotask(() => {
    owner.scheduled = false
    const participant = currentParticipant(owner)
    if (!participant?.state) return
    owner.refreshing = true
    const state = participant.state
    void state
      .refresh({ dedupe: 'defer' })
      .catch(() => undefined)
      .finally(() => {
        owner.refreshing = false
        // An already-running same-client refresh can satisfy the live echo. Only a
        // request begun before that echo needs one subsequent refresh.
        if (!state.error.value && owner.satisfied < owner.notification)
          refreshOwner(owner)
      })
  })
}

function failOwner(owner: ReadOwner, failure: ApiReadFailure) {
  owner.epoch++
  owner.requests.clear()
  const participant = currentParticipant(owner)
  if (!participant?.state) return
  participant.state.clear()
  participant.state.error.value = createError({
    statusCode: failure.statusCode,
    statusMessage: failure.message,
  })
  participant.state.status.value = 'error'
}

/** Native Nuxt acquisition plus automatic authorized live updates; never await this wrapper internally. */
export function useApiRead<T>(
  key: MaybeRefOrGetter<string>,
  handler: (context: {
    fetch: typeof $fetch
    signal: AbortSignal
  }) => Promise<T>,
  options: AsyncDataOptions<T> = {}
) {
  const nuxtApp = useNuxtApp()
  const runtime = useRuntimeConfig()
  const config = useFireUXConfig()
  const { currentUser } = useAuth()
  const requestKey = computed(() => String(toValue(key)))
  const identity = () => `${config.appId}|${currentUser.value?.uid || ''}`
  const manifests = useState<Record<string, ReadDescriptor[]>>(
    'fireux_api_read_manifests',
    () => ({})
  )
  let application = applications.get(nuxtApp)
  if (!application) {
    application = { owners: new Map() }
    applications.set(nuxtApp, application)
  }
  const app = application
  if (import.meta.client && !app.connections) {
    const base = String(runtime.app.baseURL || '/').replace(/\/$/, '')
    app.connections = createApiReadConnections({
      endpoint: `${base}/api/live`,
      token: async (force) => currentUser.value?.getIdToken(force),
    })
    app.connections.setIdentity(identity())
  }

  function ownerFor(value: string) {
    let owner = app.owners.get(value)
    if (!owner) {
      const supplied =
        Object.hasOwn(manifests.value, value) &&
        Array.isArray(manifests.value[value])
          ? manifests.value[value]!
          : []
      owner = {
        key: value,
        epoch: 0,
        notification: 0,
        satisfied: 0,
        wanted: new Map(),
        requests: createApiReadRequests(),
        protected: supplied.some((item) => item.access === 'protected'),
        participants: new Set(),
        descriptors: new Map(
          supplied.map((item) => [descriptorKey(item), item])
        ),
        handles: new Map(),
        scheduled: false,
        refreshing: false,
      }
      app.owners.set(value, owner)
    }
    return owner
  }
  function save(owner: ReadOwner) {
    manifests.value = {
      ...manifests.value,
      [owner.key]: [...owner.descriptors.values()],
    }
  }
  function reconcile(owner: ReadOwner) {
    if (!import.meta.client || !app.connections || !currentParticipant(owner))
      return
    for (const [id, handle] of owner.handles)
      if (!owner.descriptors.has(id)) {
        handle.stop()
        owner.handles.delete(id)
      }
    for (const [id, descriptor] of owner.descriptors) {
      const existing = owner.handles.get(id)
      if (existing) {
        existing.update(descriptor.version)
        continue
      }
      try {
        const handle = app.connections.subscribe(descriptor, {
          change: (version) => {
            owner.wanted.set(id, version)
            owner.notification++
            refreshOwner(owner)
          },
          error: (failure) => failOwner(owner, failure),
        })
        owner.handles.set(id, handle)
      } catch (cause) {
        stopHandles(owner)
        throw cause
      }
    }
  }
  function reset(owner: ReadOwner, clear: boolean) {
    owner.epoch++
    owner.requests.clear()
    stopHandles(owner)
    owner.descriptors.clear()
    owner.wanted.clear()
    save(owner)
    if (clear) nuxtApp.runWithContext(() => clearNuxtData([owner.key]))
  }

  let owner = ownerFor(requestKey.value)
  const participant: Participant = {
    key: () => requestKey.value,
    active: false,
  }
  owner.participants.add(participant)
  function leave(previous: ReadOwner) {
    previous.participants.delete(participant)
    if (![...previous.participants].some((item) => item.active))
      stopHandles(previous)
    if (!previous.participants.size) {
      previous.epoch++
      previous.requests.clear()
      if (import.meta.client && previous.protected)
        nuxtApp.runWithContext(() => clearNuxtData([previous.key]))
      app.owners.delete(previous.key)
      if (import.meta.client) {
        const next = { ...manifests.value }
        delete next[previous.key]
        manifests.value = next
      }
    }
  }
  // Register scope invalidation before Nuxt installs its acquisition watchers.
  watch(
    requestKey,
    () => {
      leave(owner)
      owner = ownerFor(requestKey.value)
      owner.participants.add(participant)
      reconcile(owner)
    },
    { flush: 'sync' }
  )
  if (options.watch && options.watch.length)
    watch(options.watch, () => reset(owner, owner.protected), { flush: 'sync' })
  watch(
    identity,
    () => {
      app.connections?.setIdentity(identity())
      if (!owner.protected) return
      reset(owner, true)
      owner.notification++
      refreshOwner(owner)
    },
    { flush: 'sync' }
  )

  const state = useAsyncData<T>(
    key,
    async (_app, { signal }) => {
      const current = app.owners.get(requestKey.value)
      if (!current || !current.participants.size)
        throw new DOMException('The API reader was disposed.', 'AbortError')
      const epoch = current.epoch,
        principal = identity(),
        notification = current.notification
      const descriptors = new Map<string, ReadDescriptor>()
      let protectedRead = current.protected
      const assertCurrent = () => {
        if (
          signal.aborted ||
          current.epoch !== epoch ||
          requestKey.value !== current.key ||
          (protectedRead && principal !== identity())
        )
          throw new DOMException('The API read scope changed.', 'AbortError')
      }
      const origin = import.meta.client
        ? window.location.origin
        : 'http://fireux.local'
      const record = (
        request: unknown,
        response: { headers: Headers },
        requestOptions: Record<string, unknown>,
        required: boolean
      ) => {
        const access = response.headers.get(API_READ_ACCESS_HEADER)
        if (access !== 'public' && access !== 'protected') {
          if (required && typeof request === 'string') {
            let owned = false
            try {
              apiReadUrl(request, origin)
              owned = true
            } catch {
              /* external or non-API request */
            }
            if (owned)
              throw new Error(
                'The API must declare a live projection for useApiRead.'
              )
          }
          return
        }
        protectedRead ||= access === 'protected'
        current.protected ||= protectedRead
        assertCurrent()
        if (typeof request !== 'string') return
        const url = new URL(request, origin)
        const query = requestOptions.query as
          | Record<string, unknown>
          | undefined
        for (const [name, value] of Object.entries(query || {})) {
          if (value === undefined || value === null) continue
          url.searchParams.delete(name)
          for (const item of Array.isArray(value) ? value : [value])
            url.searchParams.append(name, String(item))
        }
        const headers = new Headers(
          requestOptions.headers as HeadersInit | undefined
        )
        const language = headers.get('accept-language') || undefined
        const version = response.headers.get(API_READ_VERSION_HEADER) || ''
        if (version && !apiReadVersion(version))
          throw new Error('Invalid API projection version.')
        const descriptor: ReadDescriptor = {
          url: apiReadUrl(url.toString(), origin),
          access,
          version,
          ...(language ? { language } : {}),
        }
        descriptors.set(descriptorKey(descriptor), descriptor)
      }
      const baseFetch = $fetch.create({ cache: 'no-store' })
      const wrap = (fetcher: typeof $fetch, poolable = true): typeof $fetch => {
        const raw = async (
          request: unknown,
          input: Record<string, unknown> = {}
        ) => {
          const method = String(input.method || 'GET').toUpperCase()
          if (
            new Headers(input.headers as HeadersInit | undefined).has(
              'authorization'
            )
          ) {
            protectedRead = true
            current.protected = true
          }
          assertCurrent()
          try {
            const requestSignal = input.signal as AbortSignal | undefined
            const consumerSignal = requestSignal
              ? AbortSignal.any([signal, requestSignal])
              : signal
            const execute = (signal: AbortSignal) =>
              fetcher.raw(request as string, { ...input, signal })
            const custom = Object.keys(input).some(
              (name) => name.startsWith('on') || name === 'parseResponse'
            )
            const requestOptions = {
              ...input,
              headers: [
                ...new Headers(input.headers as HeadersInit | undefined),
              ],
              signal: undefined,
            }
            const response =
              method === 'GET' && poolable && !custom
                ? await current.requests.run(
                    JSON.stringify([request, requestOptions]),
                    consumerSignal,
                    execute
                  )
                : await execute(consumerSignal)
            assertCurrent()
            if (method === 'GET') record(request, response, input, true)
            return response
          } catch (cause) {
            const response = (cause as { response?: { headers: Headers } })
              ?.response
            if (method === 'GET' && response)
              record(request, response, input, false)
            throw cause
          }
        }
        const fetch = async (
          request: unknown,
          input?: Record<string, unknown>
        ) => (await raw(request, input))._data
        return Object.assign(fetch, {
          raw,
          create: (...args: Parameters<typeof $fetch.create>) =>
            wrap(fetcher.create(...args), false),
        }) as typeof $fetch
      }
      try {
        const value = await handler({ fetch: wrap(baseFetch), signal })
        assertCurrent()
        current.descriptors = descriptors
        const satisfied = [...current.wanted].every(
          ([id, version]) => descriptors.get(id)?.version === version
        )
        current.satisfied = satisfied ? current.notification : notification
        for (const [id, version] of current.wanted)
          if (descriptors.get(id)?.version === version)
            current.wanted.delete(id)
        save(current)
        reconcile(current)
        return value
      } catch (cause) {
        if (
          !signal.aborted &&
          current.epoch === epoch &&
          requestKey.value === current.key
        ) {
          current.descriptors = descriptors
          save(current)
          reconcile(current)
        }
        throw cause
      }
    },
    options
  )
  participant.state = state as unknown as NativeState

  let mounted = false
  function activate() {
    if (participant.active) return
    participant.active = true
    if (mounted && owner.protected) {
      reset(owner, true)
      owner.notification++
      refreshOwner(owner)
    }
    mounted = true
    reconcile(owner)
  }
  if (getCurrentInstance()) {
    onMounted(activate)
    onActivated(activate)
    onDeactivated(() => {
      participant.active = false
      if (!currentParticipant(owner)) stopHandles(owner)
    })
  } else if (import.meta.client) queueMicrotask(activate)
  onScopeDispose(() => leave(owner))
  return state
}
