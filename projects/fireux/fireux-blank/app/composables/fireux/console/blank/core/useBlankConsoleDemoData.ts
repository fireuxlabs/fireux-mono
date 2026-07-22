import type { MaybeRefOrGetter } from 'vue'
import { useConsoleDemoData } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleDemoData'
import type { BlankSurface } from '../../../../../models/blank.model'

export function useBlankConsoleDemoData(active: MaybeRefOrGetter<boolean>) {
  return useConsoleDemoData<BlankSurface[]>({
    active,
    loader: async () => {
      const { blankDemoRecords } = await import(
        '../../../../../demo/blank/scenarios'
      )
      return blankDemoRecords.map((record) => ({ ...record }))
    },
    isEmpty: (value) => value.length === 0,
  })
}
