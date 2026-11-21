import { ref, watch, type Ref, type WatchSource } from 'vue'
import { useToastify } from '../../../../composables/ui/useToastify'
import { useCommandScope } from '../../../../composables/fireux/commands/useCommandScope'
import { syncAppMediaToStorage } from '../../media/sync-app-media'
import { initializeConfiguredApp } from '../initialize-configured-app'

export function useAppInitializationAction({
  intentSources,
  canProceed,
  refreshEnv,
}: {
  intentSources: WatchSource[]
  canProceed: Ref<boolean>
  refreshEnv: () => Promise<void>
}) {
  const toast = useToastify()
  const captureIntent = useCommandScope(intentSources)

  const actionPending = ref(false)
  const proceedError = ref<string | null>(null)
  let runSequence = 0
  watch(
    intentSources,
    () => {
      runSequence += 1
      actionPending.value = false
      proceedError.value = null
    },
    { flush: 'sync' }
  )

  const onProceed = async () => {
    if (!canProceed.value || actionPending.value) return
    const isCurrent = captureIntent()
    const runId = ++runSequence
    actionPending.value = true
    proceedError.value = null
    try {
      const result = await initializeConfiguredApp()
      if (!isCurrent()) return
      const syncResult = await syncAppMediaToStorage()
      if (!isCurrent()) return
      if (syncResult.failed.length) {
        const detail = syncResult.failed
          .map((entry) => `${entry.kind}: ${entry.message}`)
          .join(' | ')
        throw new Error(`App setup is incomplete. ${detail}`)
      }

      await refreshEnv()
      if (!isCurrent()) return
      toast.success(
        result.ecosystemCreated
          ? result.appCreated
            ? 'Ecosystem and App initialized.'
            : 'Ecosystem setup repaired.'
          : result.appCreated
            ? 'App initialized.'
            : result.membershipCreated || result.membershipUpdated
              ? 'App access repaired.'
              : 'App is ready.'
      )
    } catch (e) {
      if (!isCurrent()) return
      const message =
        e instanceof Error && e.message.trim()
          ? e.message.trim()
          : 'Failed to initialize App.'
      proceedError.value = message
      toast.error(message)
      console.error('[useAppInitialization] failed', e)
    } finally {
      if (isCurrent() && runId === runSequence) actionPending.value = false
    }
  }

  return { actionPending, proceedError, onProceed }
}
