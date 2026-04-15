import { computed, type ComputedRef, type Ref, unref } from 'vue'
import { useConsoleState } from './useConsoleState'
import { normalizeString } from './console.normalize'
import type { ConsoleFamily, ConsoleHeaderData, ConsoleMode } from './console.types'

type ConsoleCardLike = {
  title: string
  subtitle?: string
  imageUrl?: string
  avatarUrl?: string
} | null

type EntityAdapterCardRef = Ref<ConsoleCardLike> | ComputedRef<ConsoleCardLike>
type EntityAdapterIdRef = Ref<string> | ComputedRef<string>
type EntityAdapterModeRef = Ref<ConsoleMode> | ComputedRef<ConsoleMode>

type UseConsoleEntityAdapterParams = {
  family: ConsoleFamily
  selectedId: EntityAdapterIdRef
  mode: EntityAdapterModeRef
  setMode: (mode: ConsoleMode) => void
  clearSelection: () => void
  card: EntityAdapterCardRef
  publishHeader?: boolean
}

const resolveHeaderImageUrl = (value: ConsoleCardLike) =>
  normalizeString(value?.imageUrl ?? value?.avatarUrl) || undefined

/**
 * Shared adapter for console entity cards.
 * Turns a selected entity card into header data and shared console shell state.
 */
export function useConsoleEntityAdapter(params: UseConsoleEntityAdapterParams) {
  const headerData = computed<ConsoleHeaderData>(() => {
    const card = unref(params.card)
    if (!card) return null

    return {
      imageUrl: resolveHeaderImageUrl(card),
      title: card.title,
      subtitle:
        normalizeString(card.subtitle) || normalizeString(unref(params.selectedId)),
    }
  })

  const consoleState = useConsoleState({
    family: params.family,
    selectedId: params.selectedId,
    mode: params.mode,
    setMode: params.setMode,
    clearSelection: params.clearSelection,
    header: headerData,
    publishHeader: params.publishHeader,
  })

  return {
    headerData,
    consoleState,
  }
}
