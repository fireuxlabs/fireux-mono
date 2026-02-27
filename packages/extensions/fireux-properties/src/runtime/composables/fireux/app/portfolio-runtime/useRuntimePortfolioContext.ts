import { computed, unref, type Ref } from 'vue'
import { normalizeMode, normalizeString, type RuntimePortfolioMode } from './shared'
import type { useRuntimePortfolioSelection } from './state'

export type UseRuntimePortfolioParams = {
  portfolioId?: string | Ref<string | null | undefined>
  mode?: RuntimePortfolioMode | Ref<RuntimePortfolioMode | null | undefined>
}

export function useRuntimePortfolioContext(
  params: UseRuntimePortfolioParams | undefined,
  selection: ReturnType<typeof useRuntimePortfolioSelection>
) {
  const portfolioIdSource = computed(() =>
    params?.portfolioId !== undefined
      ? unref(params.portfolioId)
      : selection.runtimePortfolioId.value
  )

  const modeSource = computed(() =>
    params?.mode !== undefined ? unref(params.mode) : selection.runtimePortfolioMode.value
  )

  const id = computed(() => normalizeString(portfolioIdSource.value) || '')
  const mode = computed<RuntimePortfolioMode>(() => normalizeMode(modeSource.value) ?? 'live')
  const isReadOnly = computed(() => mode.value === 'read-only')

  return { id, mode, isReadOnly }
}
