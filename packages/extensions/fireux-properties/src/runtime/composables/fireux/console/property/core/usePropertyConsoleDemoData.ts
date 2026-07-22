import { computed, type MaybeRefOrGetter } from 'vue'
import { usePropertiesConsoleDemoData } from '../../shared/usePropertiesConsoleDemoData'

export function usePropertyConsoleDemoData(active: MaybeRefOrGetter<boolean>) {
  const demoData = usePropertiesConsoleDemoData(active)
  return {
    ...demoData,
    properties: computed(
      () =>
        demoData.data.value?.flatMap((scenario) => scenario.properties) ?? []
    ),
  }
}
