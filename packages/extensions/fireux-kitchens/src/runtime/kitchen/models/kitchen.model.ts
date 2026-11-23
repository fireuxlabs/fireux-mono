import type { WorkspaceTeamMemberDocument } from 'fireux-workspace/runtime/workspace/models/team-member.model'
import type { Menu } from '../../menu/models/menu.model'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'
import type { Recipe } from '../../recipe/models/model'
import type { KitchenPromotion } from '../records/menus/promotions/promotion'
import type { Order } from '../records/order'
import type {
  KitchenIngredient,
  Preparation,
  KitchenStation,
} from '../records/prep'
import type { KitchenSale } from '../records/sale'
import type { KitchenWasteEvent } from '../records/waste-event'
import type { KitchenFulfilment } from '../utils/kitchen-fulfilment-reader'
import type { KitchenOffering } from '../utils/offering-policy'
import type { Item } from './item.model'

export const KitchenStatuses = ['draft', 'active', 'archived'] as const
export type KitchenStatus = (typeof KitchenStatuses)[number]

export const KitchenVisibilities = ['public', 'unlisted', 'private'] as const
export type KitchenVisibility = (typeof KitchenVisibilities)[number]

/** Application model. Optional slots can be loaded, derived or defined later. */
export type Kitchen = {
  // Core
  id: string
  name: string
  slug?: string
  status?: KitchenStatus
  visibility?: KitchenVisibility
  description?: string
  imageUrl?: string
  placeId?: string

  // Home & Overview views
  home?: unknown
  overview?: unknown

  // Identity & Brand
  identity?: unknown
  context?: string
  operatingHours?: WeekdayTimeWindowsConfig
  appearance?: unknown

  // Team
  team?: WorkspaceTeamMemberDocument[]
  people?: unknown
  responsibilities?: unknown

  // Menus
  menus?: Menu[]
  /** Loaded from the Kitchen's items subcollection. */
  items: Item[]
  promotions?: KitchenPromotion[]
  services?: KitchenOffering[]

  // Orders
  orders?: Order[]
  orderBoard?: unknown

  // Prep & Production
  prep?: unknown
  preparations?: Preparation[]
  prepPlan?: unknown
  recipes?: Recipe[]
  ingredients?: KitchenIngredient[]
  stations?: KitchenStation[]
  batches?: unknown

  // Stock & Purchasing
  stockPurchasing?: unknown
  stock?: unknown
  purchaseOrders?: unknown
  deliveries?: unknown
  suppliers?: unknown
  waste?: KitchenWasteEvent[]

  // Food Safety
  foodSafety?: unknown
  dueChecks?: unknown
  foodSafetyRecords?: unknown
  correctiveActions?: unknown
  procedures?: unknown

  // Reports
  reports?: unknown
  sales?: KitchenSale[]
  serviceReport?: unknown
  foodCosts?: unknown
  wasteReport?: unknown

  // Settings
  settings?: unknown
  payments?: KitchenFulfilment['payment_methods']
  integrations?: unknown
  access?: unknown

  // Calendar view
  calendar?: unknown
}
