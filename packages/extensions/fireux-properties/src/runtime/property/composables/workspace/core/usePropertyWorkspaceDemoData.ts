import { computed, type MaybeRefOrGetter } from 'vue'
import { usePropertiesWorkspaceDemoData } from '../../../../composables/fireux/workspace/shared/usePropertiesWorkspaceDemoData'

export function usePropertyWorkspaceDemoData(
  active: MaybeRefOrGetter<boolean>
) {
  const demoData = usePropertiesWorkspaceDemoData(active)
  return {
    ...demoData,
    properties: computed(
      () =>
        demoData.data.value?.flatMap((scenario) => scenario.properties) ?? []
    ),
  }
}
