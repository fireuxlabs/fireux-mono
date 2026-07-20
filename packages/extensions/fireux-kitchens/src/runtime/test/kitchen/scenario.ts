// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep mutable simulation seeding separate from console demo fixtures.
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import {
  KitchenModel,
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
  kitchen: Kitchen
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

const scenario: KitchenTestScenario = {
  kitchen: {
    ...KitchenModel,
    id: 'blank-test-kitchen',
    place_id: 'blank-test-kitchen',
    slug: 'blank-test-kitchen',
    currency_code: 'CHF',
    app_scope: {
      state: 'root_only',
      app_id: '',
    },
    visibility: {
      show: false,
      active: true,
      is_test: true,
    },
    identity: {
      display_name: 'Blank Test Kitchen',
      tagline: '',
      image_url: '',
      gallery: [],
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
      app_id: undefined,
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

export const getDefaultTestKitchen = (): KitchenTestScenario => scenario
