import { useAsyncData } from '#imports'
import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  useId,
  watch,
  type MaybeRefOrGetter,
  type WatchSource,
} from 'vue'
import { useMenuEditorScope } from './useMenuEditorScope'

export type MenuFilePreviewRead = {
  signal: AbortSignal
  isCurrent: () => boolean
}

/** Protected Menu bytes live only as long as their visible record and authority. */
export function useMenuFilePreview(input: {
  enabled: MaybeRefOrGetter<boolean>
  sources: WatchSource[]
  read: (context: MenuFilePreviewRead) => Promise<Blob>
}) {
  const enabled = computed(() => toValue(input.enabled))
  const revision = ref(0)
  const url = ref('')
  let clear = () => {}
  function release() {
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = ''
  }
  const capture = useMenuEditorScope([enabled, ...input.sources], () => {
    release()
    clear()
    revision.value++
  })
  const acquisition = useAsyncData(
    `menu-file-preview:${useId()}`,
    async (_app: unknown, { signal }: { signal: AbortSignal }) => {
      const requestRevision = revision.value
      const current = capture()
      const isCurrent = () => enabled.value && !signal.aborted && current()
      if (!isCurrent()) return { revision: requestRevision, blob: null }
      const blob = await input.read({ signal, isCurrent })
      if (!isCurrent()) return { revision: requestRevision, blob: null }
      if (!(blob instanceof Blob))
        throw new Error('The file could not be opened.')
      return { revision: requestRevision, blob }
    },
    {
      server: false,
      serialize: false,
      deep: false,
      enabled,
      watch: [revision],
      getCachedData: () => undefined,
    }
  )
  clear = acquisition.clear
  watch(
    acquisition.data,
    (result) => {
      release()
      if (enabled.value && result?.revision === revision.value && result.blob)
        url.value = URL.createObjectURL(result.blob)
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    release()
    clear()
  })
  async function retry() {
    if (!enabled.value || !import.meta.client) return
    release()
    clear()
    await acquisition.refresh()
  }
  function open() {
    if (import.meta.client && enabled.value && url.value)
      window.open(url.value, '_blank', 'noopener,noreferrer')
  }
  return {
    url,
    pending: computed(
      () =>
        enabled.value && ['idle', 'pending'].includes(acquisition.status.value)
    ),
    error: computed(() => {
      const cause = acquisition.error.value as
        | { data?: { statusMessage?: string }; statusMessage?: string }
        | undefined
      return cause
        ? cause.data?.statusMessage ||
            cause.statusMessage ||
            'The file could not be opened. Try again.'
        : ''
    }),
    retry,
    open,
  }
}

/** Match the protected file endpoints without exposing storage identity to them. */
export async function menuFileRevision(identity: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(identity)
  )
  return Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, '0')
  ).join('')
}
