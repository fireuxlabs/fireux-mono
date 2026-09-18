import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import type { KitchenMenu } from '../../menu/models/kitchen-menu.model'
import type { KitchenService } from '../models/service.model'

/** Configuration guidance only: payments, delivery eligibility and checkout still own acceptance. */
export function serviceSetupSummary(
  service: KitchenService,
  menus: KitchenMenu[],
  menusOutcome: ReadOutcome
) {
  const menusReady = menusOutcome === 'ready' || menusOutcome === 'empty'
  const menusPending = menusOutcome === 'pending' || menusOutcome === 'idle'
  const selectedMenus = menusReady
    ? menus.filter((menu) => service.menu_ids.includes(menu.id))
    : []
  const orderMenus = selectedMenus.filter(
    (menu) => menu.status === 'published' && !menu.doc?.url?.trim()
  )
  const ordering = service.interactions.filter(
    (interaction) =>
      ['collection', 'delivery', 'pre_order'].includes(interaction.type) &&
      interaction.enabled
  )
  const hasHours = Boolean(
    service.hours?.timezone && service.hours.windows.length
  )
  const checks = [
    {
      key: 'menus',
      label:
        menusOutcome === 'error'
          ? 'Menu check unavailable'
          : 'Published menu for ordering',
      done: menusReady && orderMenus.length > 0,
      pending: menusPending,
      href: '#service-menus',
    },
    {
      key: 'hours',
      label: 'Serving hours',
      done: hasHours,
      pending: false,
      href: '#service-hours',
    },
    {
      key: 'ordering',
      label: 'Collection, delivery or pre-order',
      done: ordering.length > 0,
      pending: false,
      href: '#service-interactions',
    },
  ]
  const configured = checks.every((check) => check.done)
  const paused =
    ordering.length > 0 &&
    ordering.every(
      (interaction) =>
        interaction.type !== 'browse' &&
        interaction.availability?.paused === true
    )
  return {
    selectedMenus,
    orderMenus,
    ordering,
    hasHours,
    checks,
    configured,
    paused,
    // Only represent what the service command itself requires; this is not a checkout gate.
    canEnable:
      service.menu_ids.length > 0 &&
      (!service.interactions.some(
        (interaction) => interaction.type !== 'browse' && interaction.enabled
      ) ||
        hasHours),
  }
}
