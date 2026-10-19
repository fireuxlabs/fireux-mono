import { computed, ref, watch } from 'vue'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenMenuRecordContext } from './useKitchenMenuRecordContext'
import {
  menuProcessNumberText as numberText,
  menuProcessOptionLabel as optionLabel,
  menuProcessPriceText as priceText,
  menuProcessRecord as record,
  menuProcessRecords as records,
  menuProcessText as text,
} from '../../../utils/menu-process-view'
import { useMenuEditorScope } from '../../../../menu/composables/useMenuEditorScope'

export type MenuSourceProcessContext = Pick<
  ReturnType<typeof useKitchenMenuRecordContext>,
  'menu' | 'source' | 'menuId' | 'kitchenId' | 'activeKitchenAppId' | 'canWrite'
>

export function useMenuSourceProcess(context?: MenuSourceProcessContext) {
  const { menu, source, menuId, kitchenId, activeKitchenAppId, canWrite } =
    context ?? useKitchenMenuRecordContext()
  const { currentUser } = useAuth()
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const authToken = ref('')
  const pendingMode = ref<'standard' | 'strong' | ''>('')
  const error = ref('')
  const result = ref<Record<string, unknown> | null>(null)
  const processDescription = computed(() =>
    menu.value
      ? 'Convert the upload and save a review draft. Published menus are not overwritten automatically.'
      : 'Convert this upload into a new draft menu.'
  )
  const sourceDescription =
    'Reads the saved source and saves a structured menu draft. Processing can take several minutes; if interrupted, retry resumes from the last saved checkpoint.'
  const uploadId = computed(
    () => text(record(source.value).id) || text(menuId.value)
  )
  const captureScope = useMenuEditorScope(
    [kitchenId, menuId, activeKitchenAppId, uploadId],
    () => {
      pendingMode.value = ''
      error.value = ''
      result.value = null
    }
  )
  const sourceDraft = computed(() => record(record(source.value).ai_draft))
  const sourceProcess = computed(() => record(record(source.value).ai_process))
  const persistedStage = computed(() => text(sourceProcess.value.stage))
  const persistedProcessMessage = computed(() => {
    if (result.value) return ''
    if (persistedStage.value === 'extracting') {
      return 'Extraction is the last saved stage. If the earlier request has ended, retry processing.'
    }
    if (persistedStage.value === 'normalizing') {
      return 'The extracted draft is checkpointed and normalization is the last saved stage. If the earlier request has ended, retry to resume cleanup.'
    }
    return ''
  })
  const statusMessage = computed(() => {
    if (pendingMode.value === 'standard') {
      return 'Converting and saving the upload. Keep this tab open; this may take several minutes.'
    }

    if (pendingMode.value === 'strong') {
      return 'Processing with the stronger model. Keep this tab open; this may take several minutes and costs more than the recommended pass.'
    }

    return persistedProcessMessage.value
  })
  const persistedError = computed(() =>
    persistedStage.value === 'failed'
      ? text(sourceProcess.value.reason) ||
        'The previous menu processing run failed.'
      : ''
  )
  const displayError = computed(() => error.value || persistedError.value)
  const canProcess = computed(() =>
    Boolean(
      canWrite.value &&
        source.value &&
        activeKitchenAppId.value &&
        kitchenId.value &&
        menuId.value &&
        authToken.value &&
        !pendingMode.value
    )
  )
  const persistedReport = computed(() => record(sourceDraft.value.report))
  const counts = computed(() => {
    const local = record(record(result.value?.comparison).counts)
    return Object.keys(local).length
      ? local
      : record(persistedReport.value.counts)
  })
  const showStats = computed(() =>
    Boolean(result.value || Object.keys(counts.value).length)
  )
  const stats = computed(() => [
    { label: 'Source files', value: numberText(counts.value.source_files) },
    {
      label: 'Raw items',
      value: numberText(
        counts.value.raw_extracted_items ?? counts.value.extracted_items
      ),
    },
    {
      label: 'Draft items',
      value: numberText(
        counts.value.normalized_items ?? counts.value.extracted_items
      ),
    },
    {
      label: 'Draft variants',
      value: numberText(counts.value.extracted_price_options),
    },
    {
      label: 'Draft add-ons',
      value: numberText(counts.value.extracted_add_ons),
    },
    { label: 'Review flags', value: String(flags.value.length) },
    {
      label: 'Menu write',
      value:
        text(record(result.value?.write).action) ||
        text(record(sourceDraft.value.write).action) ||
        'Pending',
    },
    {
      label: 'AI calls',
      value: numberText(
        record(result.value?.cost).planned_ai_calls ??
          record(sourceDraft.value.cache).planned_ai_calls
      ),
    },
  ])
  const fileResults = computed(() =>
    records(record(result.value?.extracted).files).map((file) => ({
      id: text(file.id),
      file_name: text(file.file_name),
      status: text(file.status),
    }))
  )
  const toFlags = (value: unknown) =>
    records(value).map((flag) => ({
      code: text(flag.code),
      level: text(flag.level),
      message: text(flag.message),
    }))
  const flags = computed(() => {
    const local = toFlags(record(result.value?.comparison).flags)
    return local.length ? local : toFlags(persistedReport.value.flags)
  })
  const writeMessage = computed(
    () =>
      text(result.value?.message) ||
      text(record(result.value?.write).action) ||
      text(record(sourceDraft.value.write).action)
  )
  const toSections = (value: unknown) =>
    records(value).map((section) => ({
      label: text(section.label),
      items: records(section.items).map((item) => ({
        name: text(item.name),
        description: text(item.description),
        price: priceText(item.price),
        addOns: records(item.add_ons)
          .map((option) => ({
            label: optionLabel(option),
            price: priceText(option.price),
          }))
          .filter((option) => option.label && option.price),
        priceOptions: records(item.price_options)
          .map((option) => ({
            label: optionLabel(option),
            price: priceText(option.price),
          }))
          .filter((option) => option.label && option.price),
      })),
    }))
  const currentSections = computed(() =>
    toSections(record(result.value?.current).sections)
  )
  const extractedSections = computed(() =>
    toSections(record(result.value?.extracted).sections)
  )
  const normalizedSections = computed(() =>
    toSections(record(result.value?.normalized).sections)
  )
  const persistedDraftSections = computed(() =>
    toSections(sourceDraft.value.sections)
  )
  const draftSections = computed(() =>
    normalizedSections.value.length
      ? normalizedSections.value
      : extractedSections.value.length
        ? extractedSections.value
        : persistedDraftSections.value
  )
  const hasDraft = computed(
    () =>
      Boolean(result.value) ||
      draftSections.value.some((section) => section.items.length)
  )
  watch(
    currentUser,
    async (
      user: { getIdToken: () => Promise<string> } | null,
      _previous,
      onCleanup
    ) => {
      let current = true
      onCleanup(() => {
        current = false
      })
      authToken.value = ''
      if (!import.meta.client || !user) return
      try {
        const token = await user.getIdToken()
        if (current) authToken.value = token
      } catch {
        if (current) error.value = 'Sign in again before processing.'
      }
    },
    { immediate: true }
  )

  async function processSource(mode: 'standard' | 'strong') {
    error.value = ''
    result.value = null

    if (!canProcess.value) {
      error.value = 'Upload a source document and sign in before processing.'
      return
    }

    const isCurrent = captureScope()
    pendingMode.value = mode

    try {
      requireWritableData()
      const response = await fetch('/api/workspace/kitchen/menus/process', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: activeKitchenAppId.value,
          kitchenId: kitchenId.value,
          menuId: menuId.value,
          uploadId: uploadId.value,
          quality: mode,
          force: mode === 'strong',
          confirmBilling: true,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(
          text(payload?.statusMessage) ||
            text(payload?.message) ||
            `Process failed with status ${response.status}.`
        )
      }

      if (isCurrent()) result.value = payload as Record<string, unknown>
    } catch (cause) {
      if (!isCurrent()) return
      error.value =
        cause instanceof Error ? cause.message : 'Menu processing failed.'
    } finally {
      if (isCurrent()) pendingMode.value = ''
    }
  }
  return {
    menu,
    source,
    menuId,
    kitchenId,
    activeKitchenAppId,
    canWrite,
    authToken,
    pendingMode,
    result,
    processDescription,
    sourceDescription,
    statusMessage,
    displayError,
    canProcess,
    showStats,
    stats,
    fileResults,
    flags,
    writeMessage,
    currentSections,
    draftSections,
    hasDraft,
    processSource,
  }
}
