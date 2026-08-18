// Product Demo composable: browser data loading and stable public exports.
import { useAsyncData, useRequestFetch } from '#imports'
import type {
  PublicIngredient,
  PublicIngredientCollectionResponse,
} from 'fireux-kitchens/runtime/ingredient/models/ingredient-public.model'
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
  const requestFetch = useRequestFetch()
  const loadIngredientRoots = async (ids: string[]) => {
    const pages = await Promise.all(
      Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => {
        const chunk = ids.slice(index * 100, (index + 1) * 100)
        return requestFetch<PublicIngredientCollectionResponse>(
          `/api/ingredients?ids=${encodeURIComponent(chunk.join(','))}`
        )
      })
    )
    return pages.flatMap(
      (page: PublicIngredientCollectionResponse) => page.items
    )
  }
  const state = await useAsyncData<MiseboxProductDemoModel>(
    'misebox-product-demo-production-v12',
    async () => {
      try {
        return await loadMiseboxProductDemo(loadIngredientRoots)
      }
      catch (error) {
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
