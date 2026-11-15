import { computed, ref, watch, type MaybeRefOrGetter, toValue } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useKitchenWorkspace } from './useKitchenWorkspace'
import {
  resolveKitchenGuidance,
  type KitchenGuidanceId,
} from '../../content/guidance'

/** Reuses the selected Workspace root; no second guidance reader or listener. */
export function useKitchenGuidance(
  kitchenId: MaybeRefOrGetter<string>,
  canWrite: MaybeRefOrGetter<boolean>
) {
  const workspace = useKitchenWorkspace()
  const { currentUser } = useAuth()
  const session = useAppSession()
  const config = useFireUXConfig()
  const route = useRoute()
  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')
  const accepted = ref<KitchenGuidanceId[] | null>(null)
  const ready = computed(
    () =>
      workspace.outcome.value === 'ready' &&
      workspace.root.value?.id === toValue(kitchenId) &&
      Boolean(currentUser.value) &&
      !session.pending.value &&
      !session.error.value
  )
  const stored = computed(() =>
    ready.value
      ? resolveKitchenGuidance(workspace.root.value?.guidance_ids).map(
          (guide) => guide.id
        )
      : []
  )
  const value = computed(() => accepted.value ?? stored.value)
  const scopeKey = computed(() =>
    JSON.stringify([
      config.appId,
      currentUser.value?.uid,
      session.appUser.value,
      session.pending.value,
      Boolean(session.error.value),
      route.path,
      toValue(kitchenId),
      workspace.id.value,
      ready.value,
      toValue(canWrite),
    ])
  )
  const capture = useCommandScope([scopeKey])
  watch(
    scopeKey,
    () => {
      saving.value = false
      saved.value = false
      error.value = ''
      accepted.value = ready.value ? [...stored.value] : null
    },
    { immediate: true, flush: 'sync' }
  )
  function reload() {
    if (saving.value || !ready.value) return
    accepted.value = [...stored.value]
    saved.value = false
    error.value = ''
  }

  async function save(ids: KitchenGuidanceId[]) {
    if (!ready.value || !toValue(canWrite) || saving.value) return
    const user = currentUser.value
    if (!user) return
    const body = {
      kitchenId: toValue(kitchenId),
      guidanceIds: [...ids],
      previous: [...value.value],
    }
    const isCurrent = capture()
    saving.value = true
    saved.value = false
    error.value = ''
    try {
      const token = await user.getIdToken()
      if (!isCurrent()) return
      const result = await $fetch<{
        kitchenId: string
        guidanceIds: KitchenGuidanceId[]
      }>('/api/workspace/kitchen/guidance', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body,
      })
      if (!isCurrent()) return
      if (
        result.kitchenId !== body.kitchenId ||
        JSON.stringify(result.guidanceIds) !==
          JSON.stringify(
            resolveKitchenGuidance(body.guidanceIds).map((guide) => guide.id)
          )
      )
        throw new Error('Shared guidance response did not match this Kitchen.')
      accepted.value = result.guidanceIds
      saved.value = true
    } catch (failure) {
      if (isCurrent()) {
        const issue = failure as {
          data?: { statusMessage?: string }
          message?: string
        }
        error.value =
          issue.data?.statusMessage ||
          issue.message ||
          'Shared guidance could not be saved.'
      }
    } finally {
      if (isCurrent()) saving.value = false
    }
  }
  return { value, ready, saving, saved, error, scopeKey, save, reload }
}
