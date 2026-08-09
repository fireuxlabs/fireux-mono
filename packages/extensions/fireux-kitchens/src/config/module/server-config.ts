// Concurrent edit — 2026-07-20 13:12 CEST — Driver security: register trusted access and minimal dispatch endpoints.
// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: register bounded Chef and Driver routes.
// Concurrent edit — 2026-07-20 17:44 CEST — Repo Efficiency Pass 2 of 6: register trusted Kitchen profile provisioners.
// Concurrent edit — 2026-07-20 22:04 CEST — Place-root authority pass: register the bounded public Kitchen/Place projection.
// Concurrent edit — 2026-07-21 16:57 CEST — Kitchen Finance surface: register the bounded gross-sales report endpoint.
// Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: register authenticated preview and atomic completion endpoints.
// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: register the authenticated bounded target projection.
// Concurrent edit — 2026-07-22 00:38 CEST — Dish image server: register the canonical Dish image upload endpoint.
// Concurrent edit — 2026-07-22 12:24 CEST — Canonical Kitchen theme write: register the trusted root style mutation.
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const baseServerHandlers = [
  {
    route: '/api/supply/suppliers',
    method: 'get',
    handler: './runtime/server/api/supply/suppliers.get',
  },
  {
    route: '/api/ingredients',
    method: 'get',
    handler: './runtime/server/api/ingredients/index.get',
  },
  {
    route: '/api/ingredients/:id',
    method: 'get',
    handler: './runtime/server/api/ingredients/[id].get',
  },
  {
    route: '/api/internal/ingredients',
    method: 'get',
    handler: './runtime/server/api/internal/ingredients/index.get',
  },
  {
    route: '/api/internal/ingredients',
    method: 'post',
    handler: './runtime/server/api/internal/ingredients/index.post',
  },
  {
    route: '/api/internal/ingredients/:id',
    method: 'patch',
    handler: './runtime/server/api/internal/ingredients/[id].patch',
  },
  {
    route: '/api/kitchens',
    method: 'get',
    handler: './runtime/server/api/kitchens/index.get',
  },
  {
    route: '/sitemaps/kitchens.xml',
    method: 'get',
    handler: './runtime/server/sitemaps/kitchens.xml.get',
  },
  {
    route: '/api/kitchens/onboarding/preview',
    method: 'post',
    handler: './runtime/server/api/kitchens/onboarding/preview.post',
  },
  {
    route: '/api/kitchens/onboarding/complete',
    method: 'post',
    handler: './runtime/server/api/kitchens/onboarding/complete.post',
  },
  {
    route: '/api/internal/profiles/chef',
    method: 'post',
    handler: './runtime/server/api/internal/profiles/chef.post',
  },
  {
    route: '/api/internal/profiles/customer',
    method: 'post',
    handler: './runtime/server/api/internal/profiles/customer.post',
  },
  {
    route: '/api/internal/profiles/driver',
    method: 'post',
    handler: './runtime/server/api/internal/profiles/driver.post',
  },
  {
    route: '/api/public/chefs',
    method: 'get',
    handler: './runtime/server/api/public/chefs.get',
  },
  {
    route: '/api/public/chefs/:id',
    method: 'get',
    handler: './runtime/server/api/public/chefs/[id].get',
  },
  {
    route: '/api/public/drivers',
    method: 'get',
    handler: './runtime/server/api/public/drivers.get',
  },
  {
    route: '/api/public/drivers/:id',
    method: 'get',
    handler: './runtime/server/api/public/drivers/[id].get',
  },
  {
    route: '/api/internal/kitchen/driver-access',
    method: 'post',
    handler: './runtime/server/api/internal/kitchen/driver-access.post',
  },
  {
    route: '/api/internal/driver/dispatches',
    method: 'get',
    handler: './runtime/server/api/internal/driver/dispatches.get',
  },
  {
    route: '/api/internal/driver/dispatch-watch',
    method: 'post',
    handler: './runtime/server/api/internal/driver/dispatch-watch.post',
  },
  {
    route: '/api/customer/orders',
    method: 'get',
    handler: './runtime/server/api/customer/orders.get',
  },
  {
    route: '/api/console/kitchen/orders/transition',
    method: 'post',
    handler: './runtime/server/api/console/kitchen/orders/transition.post',
  },
  {
    route: '/api/console/kitchen/orders/end-service',
    method: 'post',
    handler: './runtime/server/api/console/kitchen/orders/end-service.post',
  },
  {
    route: '/api/console/kitchen/targets',
    method: 'get',
    handler: './runtime/server/api/console/kitchen/targets.get',
  },
  {
    route: '/api/console/kitchen/theme',
    method: 'post',
    handler: './runtime/server/api/console/kitchen/theme.post',
  },
  {
    route: '/api/console/kitchen/update',
    method: 'patch',
    handler: './runtime/server/api/console/kitchen/update.patch',
  },
  {
    route: '/api/console/kitchen/reports/gross-sales',
    method: 'get',
    handler:
      './runtime/server/api/console/kitchen/reports/gross-sales.get',
  },
  {
    route: '/api/console/kitchen/dishes/:dishId/image',
    method: 'post',
    handler:
      './runtime/server/api/console/kitchen/dishes/[dishId]/image.post',
  },
  {
    route: '/api/console/kitchen/menus/upload',
    method: 'post',
    handler: './runtime/server/api/console/kitchen/menus/upload.post',
  },
  {
    route: '/api/console/kitchen/menus/upload',
    method: 'options',
    handler: './runtime/server/api/console/kitchen/menus/upload.options',
  },
  {
    route: '/api/console/kitchen/menus/upload/availability',
    method: 'get',
    handler: './runtime/server/api/console/kitchen/menus/upload/availability.get',
  },
  {
    route: '/api/console/kitchen/menus/upload/availability',
    method: 'options',
    handler:
      './runtime/server/api/console/kitchen/menus/upload/availability.options',
  },
  {
    route: '/api/menus/:menuId/delivery-address',
    method: 'post',
    handler: './runtime/server/api/menus/[menuId]/delivery-address.post',
  },
  {
    route: '/api/menus/:menuId/orders',
    method: 'post',
    handler: './runtime/server/api/menus/[menuId]/orders.post',
  },
  {
    route: '/api/menus/:menuId/orders',
    method: 'options',
    handler: './runtime/server/api/menus/[menuId]/orders.options',
  },
  {
    route: '/api/menus/:menuId/orders/:orderId',
    method: 'get',
    handler: './runtime/server/api/menus/[menuId]/orders/[orderId].get',
  },
  {
    route: '/api/menus/:menuId/orders/:orderId/checkout-session',
    method: 'post',
    handler:
      './runtime/server/api/menus/[menuId]/orders/[orderId]/checkout-session.post',
  },
  // 2026-07-19 15:28 CEST: Register the customer-owned response on the same canonical Menu Order route family; do not fork a customer Order API.
  {
    route: '/api/menus/:menuId/orders/:orderId/customer-response',
    method: 'post',
    handler:
      './runtime/server/api/menus/[menuId]/orders/[orderId]/customer-response.post',
  },
  {
    route: '/api/menus/payments/stripe-webhook',
    method: 'post',
    handler: './runtime/server/api/menus/payments/stripe-webhook.post',
  },
] satisfies FireuxServerHandler[]

const aiServerHandlers = [
  {
    route: '/api/console/kitchen/menus/process-estimate',
    method: 'post',
    handler:
      './runtime/server/api/console/kitchen/menus/process-estimate.post',
  },
  {
    route: '/api/console/kitchen/menus/process',
    method: 'post',
    handler: './runtime/server/api/console/kitchen/menus/process.post',
  },
] satisfies FireuxServerHandler[]

const fireuxModules = (nuxt?: Nuxt) => {
  const runtime = (nuxt?.options.runtimeConfig ?? {}) as Record<string, any>
  const modules = runtime.public?.fireux?.modules

  return Array.isArray(modules) ? modules.map(String) : []
}

export function configureServer(resolver: Resolver, nuxt?: Nuxt) {
  registerServerHandlers(resolver, baseServerHandlers)

  // Kitchen AI processing depends on fireux-ai. Tenant apps can still consume kitchen menus without bundling AI server utilities.
  if (fireuxModules(nuxt).includes('fireux-ai')) {
    registerServerHandlers(resolver, aiServerHandlers)
  }
}
