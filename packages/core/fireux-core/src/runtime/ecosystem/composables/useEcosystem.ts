import { computed, unref, type MaybeRef } from 'vue'
import { useEcosystemRead } from './useEcosystemRead'
import { useEcosystemCreate } from './useEcosystemCreate'
import { useEcosystemUpdate } from './useEcosystemUpdate'
import { useEcosystemDeletion } from './useEcosystemDeletion'

/** Root Ecosystem entity entrance. Apps reference it through ecosystem_id. */
export function useEcosystem(id: MaybeRef<string | null | undefined>) {
  const ecosystemId = computed(() => String(unref(id) || '').trim())
  const { ecosystem, pending, error } = useEcosystemRead(ecosystemId)
  const { createEcosystem } = useEcosystemCreate()
  const { updateEcosystem } = useEcosystemUpdate(ecosystemId)
  const deletion = useEcosystemDeletion()
  return {
    read: { data: ecosystem, pending, error },
    create: createEcosystem,
    update: updateEcosystem,
    deletion,
  }
}
