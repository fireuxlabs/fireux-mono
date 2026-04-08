// useConsoleState.ts
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
  createDefaultConsoleSelectionState,
  toConsoleFamilyPath,
  toConsoleHeaderStateKey,
  toConsoleSelectionStateKey,
} from '../app/routing/consoleRoutes'
import { useConsoleNav } from '../app/routing/useConsoleNav'
import { useNavGrouping } from '../app/ui/nav/useNavGrouping'
import { useConsoleNotifications } from '../app/ui/useConsoleNotifications'
import { normalizeConsoleMode, normalizeString } from './console.normalize'
import type {
  ConsoleFamily,
  ConsoleStateApi,
  ConsoleHeaderData,
  ConsoleMode,
  ConsoleModeOption,
  ConsoleSelectionState,
} from './console.types'

type HeaderRef = Ref<ConsoleHeaderData> | ComputedRef<ConsoleHeaderData>
type IdRef = Ref<string> | ComputedRef<string>
type ModeRef = Ref<ConsoleMode> | ComputedRef<ConsoleMode>

type UseConsoleStateParams = {
  family: ConsoleFamily
  selectedId: IdRef
  mode: ModeRef
  setMode: (mode: ConsoleMode) => void
  clearSelection: () => void
  header: HeaderRef
  publishHeader?: boolean
  modeOptions?: readonly ConsoleModeOption[]
}

type ConsoleLayoutApi = {
  open: Ref<boolean>
  isNotificationsSlideoverOpen: Ref<boolean>
  family: ComputedRef<ConsoleFamily | ''>
  selectedId: ComputedRef<string>
  mode: ComputedRef<ConsoleMode>
  hasSelection: ComputedRef<boolean>
  header: ComputedRef<ConsoleHeaderData>
  topNav: ComputedRef<any[]>
  middleNav: ComputedRef<any[]>
  familyRootNav: ComputedRef<any[]>
  regularBottomNav: ComputedRef<any[]>
}

const DEFAULT_CONSOLE_MODE_OPTIONS = [
  { value: 'live', label: 'Live' },
] as const satisfies readonly ConsoleModeOption[]

const normalizeHeader = (value: unknown): ConsoleHeaderData => {
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

function useConsoleHeaderState(family: ConsoleFamily | string) {
  return useState<ConsoleHeaderData>(toConsoleHeaderStateKey(family), () => null)
}

function usePublishConsoleHeader(
  family: ConsoleFamily | string,
  header: HeaderRef
) {
  const state = useConsoleHeaderState(family)
  const normalizedHeader = computed(() => normalizeHeader(unref(header)))

  watchEffect(() => {
    state.value = normalizedHeader.value
  })

  return state
}

/**
 * Layout reader branch.
 * Reads the active console shell state for the current route family.
 */
function useActiveConsoleState(): ConsoleLayoutApi {
  const open = ref(false)
  const route = useRoute()
  const { isOpen: isNotificationsSlideoverOpen } = useConsoleNotifications()
  const { desktop } = useConsoleNav()
  const { topNav, middleNav, bottomNav } = useNavGrouping(desktop)

  const family = computed(() => consoleFamilyFromPath(String(route.path || '')))
  const activeSelection = computed(() => {
    if (!family.value) return null

    return useState<ConsoleSelectionState>(
      toConsoleSelectionStateKey(family.value),
      createDefaultConsoleSelectionState
    ).value
  })

  const selectedId = computed(() =>
    normalizeString(activeSelection.value?.selectedId)
  )

  const mode = computed<ConsoleMode>(() =>
    normalizeConsoleMode(activeSelection.value?.mode, { defaultMode: 'live' })
  )

  const hasSelection = computed(() => Boolean(selectedId.value))

  const header = computed<ConsoleHeaderData>(() => {
    if (!family.value) return null
    return normalizeHeader(useConsoleHeaderState(family.value).value)
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

export function useConsoleState(): ConsoleLayoutApi
export function useConsoleState(params: UseConsoleStateParams): ConsoleStateApi

/**
 * Entity adapter branch.
 * Adapts entity-specific selection and header state into the shared console shell contract.
 */
export function useConsoleState(params?: UseConsoleStateParams) {
  if (!params) return useActiveConsoleState()

  const family = normalizeString(params.family) as ConsoleFamily
  const selectedId = computed(() => normalizeString(unref(params.selectedId)))
  const mode = computed<ConsoleMode>(() =>
    normalizeConsoleMode(unref(params.mode), { defaultMode: 'live' })
  )
  const header = computed<ConsoleHeaderData>(() =>
    normalizeHeader(unref(params.header))
  )
  const hasSelection = computed(() => Boolean(selectedId.value))
  const modeOptions = params.modeOptions ?? DEFAULT_CONSOLE_MODE_OPTIONS

  if (params.publishHeader) {
    usePublishConsoleHeader(family, header)
  }

  const selectMode = (value: string) => {
    const nextMode = normalizeConsoleMode(value, { defaultMode: mode.value })
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
