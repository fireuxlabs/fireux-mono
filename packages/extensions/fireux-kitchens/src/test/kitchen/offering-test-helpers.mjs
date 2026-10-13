import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

export function load(relative, names, deps = {}) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type .* from .*\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const policy = load(
  '../../runtime/kitchen/utils/ordering-policy.ts',
  'readKitchenOrderTypeConfig',
  {
    KitchenOrderContactFields: ['name', 'phone', 'email'],
    KitchenOrderTypes: [
      'dine_in',
      'eat_in',
      'takeaway',
      'collection',
      'delivery',
      'pre_order',
      'room_service',
    ],
    ...load(
      '../../runtime/kitchen/utils/ordering-whatsapp.ts',
      'readKitchenOrderWhatsAppNotificationPolicy'
    ),
  }
)
const time = load(
  '../../runtime/utils/weekday-time-config.ts',
  'weekdayTimeConfig',
  load('../../runtime/utils/weekday-time-core.ts', 'weekdayTimeCore')
)
const hours = load(
  '../../runtime/kitchen/utils/operating-hours.ts',
  'requireOperatingHours',
  {
    readWeekdayTimeWindowsConfig: time.weekdayTimeConfig.readWindowsConfig,
  }
)
export const { normalizeKitchenOfferings } = load(
  '../../runtime/kitchen/utils/offering-policy.ts',
  'normalizeKitchenOfferings',
  { ...policy, ...hours }
)
export const kioskService = {
  id: 'lunch',
  name: 'Lunch',
  enabled: true,
  menu_ids: ['food'],
  hours: {
    timezone: 'Europe/Zurich',
    source: 'custom',
    windows: [{ days: ['friday'], open: '12:00', close: '14:00' }],
  },
  interactions: [{ type: 'eat_in', enabled: true }],
}
