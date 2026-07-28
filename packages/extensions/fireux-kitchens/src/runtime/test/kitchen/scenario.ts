// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep mutable simulation seeding separate from console demo fixtures.
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { PlaceModel, type Place } from 'fireux-places/runtime/models/place.model'
import {
  KitchenModel,
  type AppKitchen,
  type Kitchen,
} from '../../models/kitchen.model'
import type { Dish } from '../../models/kitchen/dish.model'
import type { KitchenMenu } from '../../models/kitchen/menu/kitchen-menu.model'
import type { KitchenMiseTask } from '../../models/kitchen/mise.model'
import type { KitchenOrder } from '../../models/kitchen/order.model'
import type { Recipe } from '../../models/kitchen/recipe.model'
import type { KitchenStation } from '../../models/kitchen/station.model'
import type { KitchenTeamMember } from '../../models/kitchen/team.model'

type KitchenTestScenario = {
  appId: string
  kitchen: Kitchen
  place: Place
  appSupport: AppKitchen
  menuStack: {
    miseTasks: KitchenMiseTask[]
    recipes: Recipe[]
    dishes: Dish[]
    menus: KitchenMenu[]
    stations: KitchenStation[]
    team: KitchenTeamMember[]
  }
  procurementStack: {
    suppliers: never[]
    purchases: never[]
  }
  serviceStack: {
    incomingOrders: KitchenOrder[]
  }
}

const stamp: FirebaseTimestamp = {
  seconds: 1_720_000_000,
  nanoseconds: 0,
}
const appId = 'misebox-app'

const scenario: KitchenTestScenario = {
  appId,
  kitchen: {
    ...KitchenModel,
    id: 'blank-test-kitchen',
    place_id: 'blank-test-kitchen',
    slug: 'blank-test-kitchen',
    app_scope: {
      state: 'parent_app',
      app_id: appId,
    },
    visibility: {
      show: false,
      active: true,
      is_test: true,
    },
    identity: {
      display_name: 'Blank Test Kitchen',
      tagline: '',
      logo_image_url: '',
      image_shade: 'none',
      wordmark_no_logo_image_url: '',
      wordmark_image_url: '',
    },
    menus: {
      currency_format: 'dash',
      show_currency: true,
      available: false,
    },
    orders: {
      modes: [],
      default_lead_time_minutes: 0,
      acceptance_required: true,
      operation_hours: {
        source: 'custom',
        timezone: 'Europe/Zurich',
        windows: [],
      },
      printing: {
        ticket_device_id: '',
      },
    },
    tables: {
      count: 0,
    },
    fulfilment: {
      delivery_zones: [],
      payment_methods: [],
    },
    created: {
      at: stamp,
      by: undefined,
      app_id: appId,
    },
    updated: {
      at: stamp,
      by: undefined,
    },
  },
  appSupport: {
    id: 'blank-test-kitchen',
    operator_ids: [],
    team_ids: [],
    join_requests: [],
    created: {
      at: stamp,
      by: undefined,
      app_id: appId,
    },
    updated: {
      at: stamp,
      by: undefined,
    },
  },
  place: {
    ...PlaceModel,
    id: 'blank-test-kitchen',
    name: 'Blank Test Kitchen',
    short_name: 'Blank Test Kitchen',
    place_type: 'non_physical',
    timezone: 'Europe/Zurich',
    default_currency_code: 'CHF',
    source: 'manual',
    slug: 'blank-test-kitchen',
    types: ['restaurant'],
    tags: ['test'],
    entity_families: ['kitchen'],
    created: {
      at: stamp,
      by: undefined,
    },
    updated: {
      at: stamp,
      by: undefined,
    },
  },
  menuStack: {
    miseTasks: [],
    recipes: [],
    dishes: [],
    menus: [],
    stations: [],
    team: [],
  },
  procurementStack: {
    suppliers: [],
    purchases: [],
  },
  serviceStack: {
    incomingOrders: [],
  },
}

if (
  scenario.kitchen.id !== scenario.place.id ||
  scenario.kitchen.place_id !== scenario.place.id ||
  scenario.kitchen.id !== scenario.appSupport.id ||
  scenario.kitchen.app_scope.state !== 'parent_app' ||
  scenario.kitchen.app_scope.app_id !== scenario.appId ||
  scenario.appSupport.created.app_id !== scenario.appId ||
  !Array.isArray(scenario.appSupport.operator_ids) ||
  !Array.isArray(scenario.appSupport.team_ids) ||
  !Array.isArray(scenario.appSupport.join_requests)
) {
  throw new Error(
    'The Kitchen Test seed requires one same-App Kitchen, Place, and access-only AppKitchen set.'
  )
}

export const getDefaultTestKitchen = (): KitchenTestScenario => scenario
