import { useCookie, useState } from '#imports'
import { computed, ref } from 'vue'
import { resolveWorkspaceCanCreate } from '../../../utils/workspace-policy'
import { normalizeString, uniqueStrings } from '../../../utils/string'
import type {
  FireuxWorkspaceConfig,
  FireuxWorkspaceFamilyConfig,
} from '../../../../config/app/types'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'

export type WorkspaceAppMode = 'tenant' | 'global' | 'standalone'
export type WorkspaceSource = 'live' | 'test' | 'demo'
export type WorkspaceFamilyConfig = FireuxWorkspaceFamilyConfig
export type WorkspaceConfig = FireuxWorkspaceConfig

export function normalizeWorkspaceFamily(value: unknown) {
  return normalizeString(value).toLowerCase()
}

export function normalizeWorkspaceSource(value: unknown): WorkspaceSource {
  const source = normalizeString(value).toLowerCase()
  if (source === 'demo' || source === 'test') return source
  return 'live'
}

export function useWorkspace(family = '') {
  const fireux = useFireUXConfig()
  const normalizedFamily = normalizeWorkspaceFamily(family)
  const appScope = normalizeWorkspaceFamily(fireux.appId) || 'app'
  const sourceCookie = normalizedFamily
    ? useCookie<WorkspaceSource>(`fireux-workspace-${appScope}-${normalizedFamily}-source`, {
        default: () => 'live',
        sameSite: 'lax',
      })
    : ref<WorkspaceSource>('live')
  const sourceState = normalizedFamily
    ? useState<WorkspaceSource>(
        `fireux-workspace-${appScope}-${normalizedFamily}-source-state`,
        () => normalizeWorkspaceSource(sourceCookie.value)
      )
    : ref<WorkspaceSource>('live')
  const source = computed<WorkspaceSource>(() =>
    normalizeWorkspaceSource(sourceState.value)
  )
  const readOnly = computed(() => source.value === 'demo')
  const mode: WorkspaceAppMode = fireux.isTenant
    ? 'tenant'
    : fireux.isStandalone
      ? 'standalone'
      : 'global'
  const config = fireux.workspaceConfig
  const families = uniqueStrings(fireux.workspaces)
  const activeFamilyCookie = useCookie<string>(
    `fireux-workspace-${appScope}-active-family`,
    { default: () => '', sameSite: 'lax' }
  )
  const activeFamily = useState<string>(
    `fireux-workspace-${appScope}-active-family`,
    () => normalizeWorkspaceFamily(activeFamilyCookie.value)
  )
  const activeOperation = useState<string>(
    `fireux-workspace-${appScope}-active-operation`,
    () => ''
  )

  const configFor = (targetFamily = family) => {
    const key = normalizeWorkspaceFamily(targetFamily)
    return key ? config[key] : undefined
  }

  const canCreateTarget = (targetFamily = family) => {
    const key = normalizeWorkspaceFamily(targetFamily)
    if (key === normalizedFamily && readOnly.value) return false

    return resolveWorkspaceCanCreate(fireux.role, config, targetFamily)
  }

  const allowsDemo = (targetFamily = family) =>
    configFor(targetFamily)?.allowDemo !== false

  const setSource = (value: WorkspaceSource = 'live') => {
    const nextSource = normalizeWorkspaceSource(value)
    sourceState.value = nextSource
    sourceCookie.value = nextSource
  }
  const resetSource = () => setSource('live')
  const setActiveContext = (targetFamily = '', operation = '') => {
    const nextFamily = normalizeWorkspaceFamily(targetFamily)
    activeFamily.value = families.includes(nextFamily) ? nextFamily : ''
    activeFamilyCookie.value = activeFamily.value
    activeOperation.value = activeFamily.value
      ? normalizeWorkspaceFamily(operation)
      : ''
  }

  return {
    appId: fireux.appId,
    ecosystem: fireux.ecosystem,
    role: fireux.role,
    mode,
    isTenant: mode === 'tenant',
    isGlobal: mode === 'global',
    isStandalone: mode === 'standalone',
    source,
    isLive: computed(() => source.value === 'live'),
    isTest: computed(() => source.value === 'test'),
    isDemo: computed(() => source.value === 'demo'),
    readOnly,
    families,
    activeFamily,
    activeOperation,
    config,
    configFor,
    allowsDemo,
    canCreateTarget,
    setSource,
    resetSource,
    setActiveContext,
  }
}
