import type { MaybeRefOrGetter } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useConsoleDemoData } from 'fireux-core/runtime/composables/fireux/console/useConsoleDemoData'
import type { BlankSurface } from '../../../../../models/blank.model'
import { composeBlankSurface } from '../../../../../utils/blank-surface'

export function useBlankConsoleDemoData(active: MaybeRefOrGetter<boolean>) {
  const { appId } = useFireUXConfig()

  return useConsoleDemoData<BlankSurface[]>({
    active,
    loader: async () => {
      const { blankDemoScenarios } = await import(
        '../../../../../demo/blank/scenarios'
      )
      const currentAppId = String(appId || '').trim()
      return blankDemoScenarios.flatMap((scenario) => {
        if (scenario.appId !== currentAppId) return []
        const surface = composeBlankSurface({
          blank: scenario.blank,
          appSupport: scenario.appSupport,
          appId: currentAppId,
        })
        if (!surface) {
          throw new Error(
            `Blank Demo ${scenario.blank.id} failed canonical root/support composition.`
          )
        }
        return [surface]
      })
    },
    isEmpty: (value) => value.length === 0,
  })
}
