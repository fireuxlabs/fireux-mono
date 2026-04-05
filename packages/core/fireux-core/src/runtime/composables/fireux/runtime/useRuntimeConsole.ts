import { useRoute, useState } from '#imports'
import {
  computed,
  ref,
  unref,
  watchEffect,
  type ComputedRef,
  type Ref,
} from 'vue'
import {
  consoleFamilyFromPath,
  createDefaultRuntimeSelectionState,
  toConsoleFamilyPath,
  toConsoleHeaderStateKey,
  toConsoleSelectionStateKey,
} from '../app/routing/consoleRoutes'
import { useConsoleNav } from '../app/routing/useConsoleNav'
import { useNavGrouping } from '../app/ui/nav/useNavGrouping'
import { useConsoleNotifications } from '../app/ui/useConsoleNotifications'
import { normalizeRuntimeMode, normalizeString } from './runtime.normalize'
import type {
  ConsoleFamily,
  RuntimeConsoleApi,
  RuntimeConsoleHeaderData,
  RuntimeMode,
  RuntimeModeOption,
  RuntimeSelectionState,
} from './runtime.types'

type HeaderRef =
  | Ref<RuntimeConsoleHeaderData>
  | ComputedRef<RuntimeConsoleHeaderData>
type IdRef = Ref<string> | ComputedRef<string>
type ModeRef = Ref<RuntimeMode> | ComputedRef<RuntimeMode>

type UseRuntimeConsoleParams = {
  family: ConsoleFamily
  selectedId: IdRef
  mode: ModeRef
  setMode: (mode: RuntimeMode) => void
  clearSelection: () => void
  header: HeaderRef
  publishHeader?: boolean
  modeOptions?: readonly RuntimeModeOption[]
}

type RuntimeConsoleLayoutApi = {
  open: Ref<boolean>
  isConsoleEntryPage: ComputedRef<boolean>
  isNotificationsSlideoverOpen: Ref<boolean>
  family: ComputedRef<ConsoleFamily | ''>
  selectedId: ComputedRef<string>
  mode: ComputedRef<RuntimeMode>
  hasSelection: ComputedRef<boolean>
  header: ComputedRef<RuntimeConsoleHeaderData>
  topNav: ComputedRef<any[]>
  middleNav: ComputedRef<any[]>
  familyRootNav: ComputedRef<any[]>
  regularBottomNav: ComputedRef<any[]>
}

const DEFAULT_RUNTIME_MODE_OPTIONS = [
  { value: 'demo', label: 'Demo' },
  { value: 'live', label: 'Real' },
  { value: 'test', label: 'Test' },
] as const satisfies readonly RuntimeModeOption[]

const normalizeHeader = (value: unknown): RuntimeConsoleHeaderData => {
  if (!value || typeof value !== 'object') return null

  const source = value as Record<string, unknown>
  const title = normalizeString(source.title)
  if (!title) return null

  const imageUrl = normalizeString(source.imageUrl ?? source.avatarUrl)
  const subtitle = normalizeString(source.subtitle)

  return {
    title,
    imageUrl: imageUrl || undefined,
    subtitle: subtitle || undefined,
  }
}

function useRuntimeConsoleHeaderState(family: ConsoleFamily | string) {
  return useState<RuntimeConsoleHeaderData>(
    toConsoleHeaderStateKey(family),
    () => null
  )
}

function usePublishRuntimeConsoleHeader(
  family: ConsoleFamily | string,
  header: HeaderRef
) {
  const state = useRuntimeConsoleHeaderState(family)
  const normalizedHeader = computed(() => normalizeHeader(unref(header)))

  watchEffect(() => {
    state.value = normalizedHeader.value
  })

  return state
}

function useActiveRuntimeConsole(): RuntimeConsoleLayoutApi {
  const open = ref(false)
  const route = useRoute()
  const { isOpen: isNotificationsSlideoverOpen } = useConsoleNotifications()
  const { desktop } = useConsoleNav()
  const isConsoleEntryPage = computed(() => Boolean(route.meta?.consoleEntry))
  const { topNav, middleNav, bottomNav } = useNavGrouping(desktop)

  const family = computed(() => consoleFamilyFromPath(String(route.path || '')))
  const activeSelection = computed(() => {
    if (!family.value) return null

    return useState<RuntimeSelectionState>(
      toConsoleSelectionStateKey(family.value),
      createDefaultRuntimeSelectionState
    ).value
  })

  const selectedId = computed(() =>
    normalizeString(activeSelection.value?.selectedId)
  )
  const mode = computed<RuntimeMode>(() =>
    normalizeRuntimeMode(activeSelection.value?.mode)
  )
  const hasSelection = computed(() => Boolean(selectedId.value))
  const header = computed<RuntimeConsoleHeaderData>(() => {
    if (!family.value) return null
    return normalizeHeader(useRuntimeConsoleHeaderState(family.value).value)
  })

  const activeFamilyPath = computed(() =>
    family.value ? toConsoleFamilyPath(family.value) : ''
  )
  const familyRootNav = computed(() =>
    bottomNav.value.filter((item) => item.to === activeFamilyPath.value)
  )
  const regularBottomNav = computed(() =>
    bottomNav.value.filter((item) => item.to !== activeFamilyPath.value)
  )

  return {
    open,
    isConsoleEntryPage,
    isNotificationsSlideoverOpen,
    family,
    selectedId,
    mode,
    hasSelection,
    header,
    topNav,
    middleNav,
    familyRootNav,
    regularBottomNav,
  }
}

export function useRuntimeConsole(): RuntimeConsoleLayoutApi
export function useRuntimeConsole(
  params: UseRuntimeConsoleParams
): RuntimeConsoleApi
export function useRuntimeConsole(params?: UseRuntimeConsoleParams) {
  if (!params) return useActiveRuntimeConsole()

  const family = normalizeString(params.family) as ConsoleFamily
  const selectedId = computed(() => normalizeString(unref(params.selectedId)))
  const mode = computed<RuntimeMode>(() =>
    normalizeRuntimeMode(unref(params.mode))
  )
  const header = computed<RuntimeConsoleHeaderData>(() =>
    normalizeHeader(unref(params.header))
  )
  const hasSelection = computed(() => Boolean(selectedId.value))
  const modeOptions = params.modeOptions ?? DEFAULT_RUNTIME_MODE_OPTIONS

  if (params.publishHeader) {
    usePublishRuntimeConsoleHeader(family, header)
  }

  const selectMode = (value: string) => {
    const nextMode = normalizeRuntimeMode(value, { defaultMode: mode.value })
    if (nextMode === mode.value) return
    params.setMode(nextMode)
  }

  const clearSelection = () => {
    params.clearSelection()
  }

  return {
    family,
    selectedId,
    mode,
    modeOptions,
    hasSelection,
    header,
    selectMode,
    clearSelection,
  }
}
