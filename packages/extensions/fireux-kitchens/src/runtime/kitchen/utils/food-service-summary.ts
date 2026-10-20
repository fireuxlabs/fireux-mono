import { readOpeningHoursStatus } from 'fireux-places/runtime/place/utils/opening-hours-status'
import type { Menu } from '../../menu/models/menu.model'
import { constrainMenuOfferings } from '../../menu/utils/menu-hours'
import type { KitchenOffering } from '../models/offering.model'
import {
  kitchenOfferingOptions,
  offeringsForOption,
  offeringOptionStatus,
} from './offering-options'
import { isServiceMenu, serviceMenuReadiness } from './service-menus'

/** Read-only summary for the Food & drink overview. */
export function foodServiceSummary(
  offerings: KitchenOffering[],
  menus: Menu[],
  now: Date
) {
  return kitchenOfferingOptions.flatMap((option) =>
    offeringsForOption(offerings, option).flatMap((offering) => {
      const status = offeringOptionStatus(offering, option)
      if (status === 'Off') return []
      const ids =
        option.key === 'counter'
          ? [
              ...new Set(
                offering.interactions.flatMap((interaction) =>
                  interaction.enabled &&
                  (interaction.type === 'eat_in' ||
                    interaction.type === 'takeaway')
                    ? interaction.menu_ids || []
                    : []
                )
              ),
            ]
          : offering.menu_ids
      const readiness = serviceMenuReadiness(ids, menus)
      const issues: string[] = []
      if (!ids.length) issues.push('Select menus')
      else {
        if (!readiness.validSelection) issues.push('Replace unavailable menus')
        if (!readiness.hasPublishedMenu) issues.push('Publish a selected menu')
      }
      const hoursStatus = readOpeningHoursStatus(
        offering.hours, offering.hours?.timezone, now
      )
      if (!hoursStatus.known) issues.push('Set serving hours')
      const ready = readiness.canEnable && hoursStatus.known
      const windows = menus
        .filter(
          (menu) =>
            ids.includes(menu.id) &&
            menu.status === 'published' &&
            isServiceMenu(menu)
        )
        .map((menu) => {
          const hours = constrainMenuOfferings(
            [offering],
            menu.serving_hours
          )[0]?.hours
          return readOpeningHoursStatus(hours, hours?.timezone, now)
        })
      const open =
        ready &&
        status !== 'Paused' &&
        offering.collection_timing !== 'next_day' &&
        windows.some((window) => window.open)
      const next = windows
        .filter((window) => window.nextInMinutes !== null)
        .sort((a, b) => a.nextInMinutes! - b.nextInMinutes!)[0]
      const label = !ready
        ? 'Needs setup'
        : status === 'Paused'
          ? 'Paused'
          : offering.collection_timing === 'next_day'
            ? 'Next-day collection'
            : open
              ? 'Serving now'
              : !windows.some((window) => window.known)
                ? 'Needs setup'
                : next?.next
                  ? `Opens ${next.next}`
                  : 'Closed now'
      return [
        {
          key: `${option.key}:${offering.id}`,
          to: `/workspace/kitchen/food-and-drink/services#service-${option.key}`,
          name: offering.separate
            ? `${option.label} · ${offering.name}`
            : option.label,
          label,
          open,
          needsSetup: issues.length > 0,
          issues,
        },
      ]
    })
  )
}
