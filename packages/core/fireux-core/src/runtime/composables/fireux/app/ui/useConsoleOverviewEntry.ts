import { navigateTo } from '#imports'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

type UseConsoleOverviewEntryOptions = {
  runtimeId: MaybeRefOrGetter<string | null | undefined>
  mode: MaybeRefOrGetter<string | null | undefined>
  liveCount: MaybeRefOrGetter<number | null | undefined>
  readOnlyCount: MaybeRefOrGetter<number | null | undefined>
  singleLiveId: MaybeRefOrGetter<string | null | undefined>
  singleReadOnlyId: MaybeRefOrGetter<string | null | undefined>
  setActiveTarget: (targetId: string) => void
  createPath: string
  overviewPath: string
  ownershipPending?: MaybeRefOrGetter<boolean | null | undefined>
  readOnlyMode?: string
  liveMode?: string
  waitMs?: number
}

const normalizeString = (value: unknown): string => String(value || '').trim()
const normalizeCount = (value: unknown): number => {
  const count = Number(value)
  return Number.isFinite(count) && count > 0 ? count : 0
}

export function useConsoleOverviewEntry(options: UseConsoleOverviewEntryOptions) {
  const readOnlyMode = normalizeString(options.readOnlyMode || 'read-only') || 'read-only'
  const liveMode = normalizeString(options.liveMode || 'live') || 'live'
  const waitMs = Number(options.waitMs ?? 1500)

  const runtimeId = computed(() => normalizeString(toValue(options.runtimeId)))
  const mode = computed(() => normalizeString(toValue(options.mode)))
  const liveCount = computed(() => normalizeCount(toValue(options.liveCount)))
  const readOnlyCount = computed(() => normalizeCount(toValue(options.readOnlyCount)))
  const singleLiveId = computed(() => normalizeString(toValue(options.singleLiveId)))
  const singleReadOnlyId = computed(() => normalizeString(toValue(options.singleReadOnlyId)))
  const isReadOnlyMode = computed(() => mode.value === readOnlyMode)
  const isLiveMode = computed(() => mode.value === liveMode)
  const entryPending = computed(() =>
    isLiveMode.value ? Boolean(toValue(options.ownershipPending)) : false
  )

  const ensureOverviewEntry = async () => {
    const deadline = Date.now() + waitMs

    while (entryPending.value && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    if (runtimeId.value) return

    if (isReadOnlyMode.value && readOnlyCount.value === 1 && singleReadOnlyId.value) {
      options.setActiveTarget(singleReadOnlyId.value)
      await navigateTo(options.overviewPath, { replace: true })
      return
    }

    if (isLiveMode.value && liveCount.value === 1 && singleLiveId.value) {
      options.setActiveTarget(singleLiveId.value)
      await navigateTo(options.overviewPath, { replace: true })
      return
    }

    if (isLiveMode.value && liveCount.value === 0) {
      await navigateTo(options.createPath, { replace: true })
    }
  }

  return {
    entryPending,
    isReadOnlyMode,
    isLiveMode,
    ensureOverviewEntry,
  }
}
