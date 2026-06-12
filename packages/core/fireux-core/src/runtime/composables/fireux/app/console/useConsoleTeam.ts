import { computed, type Ref } from 'vue'
import { normalizeConsoleOperatorIds } from './useConsoleAuthority'

type UseConsoleTeamOptions = {
  target: Ref<unknown | null | undefined>
  targetId?: Ref<string | null | undefined>
  readOnly?: Ref<boolean>
  canWrite?: Ref<boolean>
}

const targetField = (target: unknown, key: 'team_ids' | 'operator_ids') =>
  (target as Record<string, unknown> | null | undefined)?.[key]

export function useConsoleTeam(options: UseConsoleTeamOptions) {
  const teamIds = computed(() =>
    normalizeConsoleOperatorIds(targetField(options.target.value, 'team_ids'))
  )
  const operatorIds = computed(() =>
    normalizeConsoleOperatorIds(
      targetField(options.target.value, 'operator_ids')
    )
  )
  const accessIds = computed(() =>
    Array.from(new Set([...teamIds.value, ...operatorIds.value]))
  )
  const targetId = computed(() => String(options.targetId?.value ?? '').trim())
  const readOnly = computed(() => Boolean(options.readOnly?.value))
  const canWrite = computed(() => Boolean(options.canWrite?.value))
  const debug = computed(() => ({
    targetId: targetId.value,
    teamIds: teamIds.value,
    operatorIds: operatorIds.value,
    accessIds: accessIds.value,
    teamCount: teamIds.value.length,
    operatorCount: operatorIds.value.length,
    accessCount: accessIds.value.length,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    targetId,
    teamIds,
    operatorIds,
    accessIds,
    readOnly,
    canWrite,
    debug,
  }
}
