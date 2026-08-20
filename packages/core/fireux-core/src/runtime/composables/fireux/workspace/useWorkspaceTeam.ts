import { computed, type Ref } from 'vue'
import { targetAccessIds, targetOperatorIds, targetTeamIds } from './useWorkspaceAccess'

type UseWorkspaceTeamOptions = {
  target: Ref<unknown | null | undefined>
  targetId?: Ref<string | null | undefined>
  readOnly?: Ref<boolean>
  canWrite?: Ref<boolean>
}

export function useWorkspaceTeam(options: UseWorkspaceTeamOptions) {
  const teamIds = computed(() =>
    targetTeamIds(options.target.value)
  )
  const operatorIds = computed(() =>
    targetOperatorIds(options.target.value)
  )
  const accessIds = computed(() => targetAccessIds(options.target.value))
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
