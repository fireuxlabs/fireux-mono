import type { IngredientCategory } from 'fireux-kitchens/runtime/ingredient/models/ingredient-taxonomy'
import type { KitchenFinanceReportPeriod } from 'fireux-kitchens/runtime/kitchen/models/finance-report.model'
import type { MenuManifest } from 'fireux-kitchens/runtime/menu/models/menu-detail.model'
import type { KitchenDemoMenuMode } from 'fireux-kitchens/runtime/kitchen/utils/demo-menu-cascade'
import type { PlaceImageShade } from 'fireux-places/runtime/place/utils/place-spine'

export type MiseboxProductDemoExperienceModel = {
  to: '/demo/menu'
  eyebrow: string
  title: string
  description: string
  icon: string
  accent: 'primary' | 'warning' | 'success'
  highlights: readonly string[]
}

export type MiseboxProductDemoKioskAppearanceModel =
  | 'refined'
  | 'counter'
  | 'pizzeria'

export type MiseboxProductDemoKioskModel = {
  appearance: MiseboxProductDemoKioskAppearanceModel
  id: string
  label: string
  tagline: string
  manifest: MenuManifest
  nextOrderNumber: number
  scopeKey: string
}

export type MiseboxProductDemoModel = {
  surface: 'showroom'
  dataSource: 'demo'
  workspace: {
    kitchenId: string
    kitchenName: string
    kitchenPill: {
      title: string
      subtitle: string
      imageUrl: string
      imageShade?: PlaceImageShade
    }
    dishes: {
      id: string
      imageUrl: string
      kind: string
      menuIds: string[]
      name: string
      priceLabel: string
      finance: {
        currencyCode: string
        minorUnitDigits: number
        sellingPriceMinor: number | null
        costOfSalesMinor: number
        grossProfitMinor: number | null
        foodCostPercentage: number | null
        grossMarginPercentage: number | null
        quantitySold: number | null
        totalSalesMinor: number | null
      } | null
      prepItems: {
        id: string
        name: string
        station: string
        yield: string
      }[]
      recipes: {
        id: string
        ingredientCount: number
        method: string[]
        name: string
        yield: string
      }[]
      spec: {
        assembly: string[]
        id: string
        recipeIds: string[]
        station: string
        summary: string
      }
    }[]
    ingredients: {
      foodGroup: IngredientCategory
      id: string
      imageUrl: string
      menuIds: string[]
      name: string
    }[]
    finance: {
      periods: {
        id: KitchenFinanceReportPeriod
        label: string
        currencyCode: string
        minorUnitDigits: number
        saleCount: number
        grossSalesMinor: number
        averageSaleMinor: number
      }[]
    }
    recipes: {
      id: string
      ingredientCount: number
      method: string[]
      menuIds: string[]
      name: string
      yield: string
    }[]
    stations: {
      id: string
      name: string
      description: string
      active: boolean
      sortOrder: number
    }[]
    suppliers: {
      id: string
      name: string
      headline: string
      imageUrl: string
      logoImageUrl: string
      placeImageUrl: string
      headquartersLabel: string
      categories: string[]
      deliveryAreas: string[]
      linkedIngredientCount: number
      catalogueCount: number
    }[]
    tables: {
      configuredCount: number
    }
    menus: {
      id: string
      imageAlt: string
      imageUrl: string
      defaultInService: boolean
      mode: KitchenDemoMenuMode
      name: string
    }[]
  }
  menu: {
    kitchenName: string
    kitchenTagline: string
    manifest: MenuManifest
    placeLabel: string
  }
  ordering: {
    kitchenName: string
    manifest: MenuManifest
  }
  kiosk: {
    defaultId: string
    kitchens: MiseboxProductDemoKioskModel[]
  }
  service: {
    kitchenName: string
  }
}
