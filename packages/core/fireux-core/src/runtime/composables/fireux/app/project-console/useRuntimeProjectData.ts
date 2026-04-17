import { computed, type Ref } from 'vue'

type RuntimeProjectDataParams = {
  id: Ref<string>
  entity: Ref<Record<string, unknown> | null>
  isDemo: Ref<boolean>
  scenario: Ref<unknown>
}

export function useRuntimeProjectData(_params: RuntimeProjectDataParams) {
  return computed(() => {
    const entity = _params.entity.value

    return {
      apps: [] as unknown[],
      ecosystemId: String(entity?.ecosystem_id || '').trim(),
    }
  })
}
