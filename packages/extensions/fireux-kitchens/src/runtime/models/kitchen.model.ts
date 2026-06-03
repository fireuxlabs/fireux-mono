import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model.ts'
import { FireuxAppScope } from 'fireux-core/runtime/models/core/meta.model.ts'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model.ts'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model.ts'
import type { WeeklySchedule } from 'fireux-core/runtime/models/core/time.model.ts'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
  : T

export type KitchenPublicMenuPolish = {
  /**
   * One-kitchen final polish for public menu layout.
   *
   * This is intentionally not part of shared PageStyle. If multiple kitchens
   * need the same controls later, graduate them into a real shared layout seam.
   */
  content_inset_left?: string
}

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain
 * Storage: root canonical record plus app-scoped record
 * Root path: /kitchens/<kitchenId>
 * App path: /apps/<appId>/kitchens/<kitchenId>
 * Child scope: /apps/<appId>/kitchens/<kitchenId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Kitchen is one domain entity with a root public entity and an app-hosted scoped record.
 * - The root record stays thin and canonical; the app-scoped record carries governance and private operational state.
 * - Public facade depth can vary by family; Kitchen is expected to have a richer public face than some other app-scoped entities.
 * - If Kitchen needs a richer public or operational read shape, that should be built in fetch/runtime/interface layers, not by complicating the stored model file.
 * - App authority stays user-based in the app-scoped record; Chef is an optional presentation/authorship layer, not the ownership model.
 * - Kitchen-owned operational children should live beneath the app-hosted record.
 * - If that rule changes later, update the models README first, then this file.
 */
export const KitchenStorage = {
  shape: 'both',
  root: 'kitchens/{kitchenId}',
  scope: 'apps/{appId}/kitchens/{kitchenId}',
  rootCollection: 'kitchens',
  scopeCollection: 'kitchens',
  idParam: 'kitchenId',
  children: {
    dishes: 'apps/{appId}/kitchens/{kitchenId}/dishes/{dishId}',
    ingredients: 'apps/{appId}/kitchens/{kitchenId}/ingredients/{kitchenIngredientId}',
    menus: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}',
    mise: 'apps/{appId}/kitchens/{kitchenId}/mise/{taskId}',
    orders: 'apps/{appId}/kitchens/{kitchenId}/orders/{orderId}',
    recipes: 'apps/{appId}/kitchens/{kitchenId}/recipes/{recipeId}',
    stations: 'apps/{appId}/kitchens/{kitchenId}/stations/{stationId}',
    team: 'apps/{appId}/kitchens/{kitchenId}/team/{memberId}',
  },
} as const

export const KitchenModel = {
  id: '',
  ...FireuxAppScope,
  is_test_kitchen: false,
  show: false,
  place_id: '',
  slug: '',
  name: '',
  tagline: '',
  currency_code: 'CHF',
  currency_format: 'dash' as CurrencyDisplayFormat,
  short_name: '',
  short_address: '',
  formatted_address: '',
  image_url: '',
  style: undefined as PageStyle | undefined,
  public_menu_polish: undefined as KitchenPublicMenuPolish | undefined,
  /**
   * Kitchen-level service/opening schedule.
   *
   * This can differ from Place/business hours and from Menu availability.
   * Place should own venue polish before shipping; Menu can later own its own
   * availability when a menu is only served during specific windows.
   */
  opening_hours: undefined as WeeklySchedule | undefined,

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Kitchen = WidenLiteral<typeof KitchenModel>

export type AppKitchen = {
  id: string
  operator_ids: string[]
  team_ids: string[]
  join_requests: string[]
  created: FireuxStamped['created']
  updated: FireuxStamped['updated']
}

export type KitchenCreateInput = Partial<
  Pick<
    Kitchen,
    | 'id'
    | 'place_id'
    | 'slug'
    | 'name'
    | 'currency_code'
    | 'currency_format'
    | 'short_name'
    | 'short_address'
    | 'formatted_address'
    | 'image_url'
  >
>

export type KitchenUpdateInput = Partial<
  Pick<
    Kitchen,
    | 'is_test_kitchen'
    | 'show'
    | 'place_id'
    | 'slug'
    | 'name'
    | 'tagline'
    | 'currency_code'
    | 'currency_format'
    | 'short_name'
    | 'short_address'
    | 'formatted_address'
    | 'image_url'
    | 'style'
    | 'public_menu_polish'
    | 'opening_hours'
  >
>
