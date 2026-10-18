import { isServiceMenu, serviceMenuReadiness } from './service-menus'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import type { Menu } from '../../menu/models/menu.model'
import type { KitchenOffering } from '../models/offering.model'

/** Configuration guidance only: payments, delivery eligibility and checkout still own acceptance. */
export function offeringSetupSummary(
  offering: KitchenOffering,
  menus: Menu[],
  menusOutcome: ReadOutcome
) {
  const menusReady = menusOutcome === 'ready' || menusOutcome === 'empty'
  const menusPending = menusOutcome === 'pending' || menusOutcome === 'idle'
  const selectedMenus = menusReady
    ? menus.filter((menu) => offering.menu_ids.includes(menu.id))
    : []
  const orderMenus = selectedMenus.filter(
    (menu) => isServiceMenu(menu) && menu.status === 'published'
  )
  const readiness = serviceMenuReadiness(
    offering.menu_ids,
    menusReady ? menus : []
  )
  const ordering = offering.interactions.filter(
    (interaction) =>
      ['collection', 'delivery', 'pre_order'].includes(interaction.type) &&
      interaction.enabled
  )
  const hasHours = Boolean(
    offering.hours?.timezone && offering.hours.windows.length
  )
  const checks = [
    {
      key: 'menus',
      label:
        menusOutcome === 'error'
          ? 'Menu check unavailable'
          : 'Published menu for ordering',
      done: menusReady && readiness.canEnable,
      pending: menusPending,
      href: '#offering-menus',
    },
    {
      key: 'hours',
      label: 'Serving hours',
      done: hasHours,
      pending: false,
      href: '#offering-hours',
    },
    {
      key: 'ordering',
      label: 'Collection, delivery or pre-order',
      done: ordering.length > 0,
      pending: false,
      href: '#offering-interactions',
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
    // Only represent what the offering command itself requires; this is not a checkout gate.
    canEnable:
      menusReady &&
      readiness.canEnable &&
      (!offering.interactions.some(
        (interaction) => interaction.type !== 'browse' && interaction.enabled
      ) ||
        hasHours),
  }
}
