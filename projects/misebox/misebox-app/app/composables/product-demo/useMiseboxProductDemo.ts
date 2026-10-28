import { useAsyncData } from 'nuxt/app'
// Product Demo composable: browser data loading and stable exports.
import type { IngredientDirectoryPage } from 'fireux-kitchens/runtime/ingredient/models/ingredient-directory.model'
import { experiences } from './misebox-product-demo-experiences'
import { loadMiseboxProductDemo } from './loadMiseboxProductDemo'
import type {
  MiseboxProductDemoExperienceModel,
  MiseboxProductDemoKioskAppearanceModel,
  MiseboxProductDemoKioskModel,
  MiseboxProductDemoModel,
} from './misebox-product-demo.model'

export type MiseboxProductDemo = MiseboxProductDemoModel
export type MiseboxProductDemoExperience = MiseboxProductDemoExperienceModel
export type MiseboxProductDemoKiosk = MiseboxProductDemoKioskModel
export type MiseboxProductDemoKioskAppearance =
  MiseboxProductDemoKioskAppearanceModel

export async function useMiseboxProductDemo() {
  const loadIngredientRoots = async (
    ids: string[],
    requestFetch: typeof $fetch
  ) => {
    const pages = await Promise.all(
      Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => {
        const chunk = ids.slice(index * 100, (index + 1) * 100)
        return requestFetch<IngredientDirectoryPage>(
          `/api/ingredients?ids=${encodeURIComponent(chunk.join(','))}`
        )
      })
    )
    return pages.flatMap((page: IngredientDirectoryPage) => page.items)
  }
  const state = await useAsyncData<MiseboxProductDemoModel>(
    'misebox-product-demo-production-v12',
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      try {
        return await loadMiseboxProductDemo((ids) =>
          loadIngredientRoots(ids, fetchRead)
        )
      } catch (error) {
        console.error(
          '[misebox-product-demo] Failed to load demo data.',
          error instanceof Error ? error.message : String(error)
        )
        throw error
      }
    },
    { deep: false }
  )

  return {
    ...state,
    experiences,
  }
}
