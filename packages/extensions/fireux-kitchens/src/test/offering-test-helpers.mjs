import { isFirestoreDocumentId } from '../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
export function loadOfferingSource(
  path,
  names,
  dependencies = {},
  transform = (source) => source
) {
  const source = readFileSync(
    new URL('../runtime/' + path + '.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    transform(stripTypeScriptTypes(source)) + '; return { ' + names + ' }',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
export const serviceMenuPolicy = loadOfferingSource(
  'kitchen/utils/service-menus',
  'isServiceMenu,serviceMenuReadiness,serviceMenuOptions'
)
const core = loadOfferingSource('utils/weekday-time-core', 'weekdayTimeCore')
const time = loadOfferingSource(
  'utils/weekday-time-config',
  'weekdayTimeConfig',
  core
)
const hours = loadOfferingSource(
  'kitchen/utils/operating-hours',
  'requireOperatingHours',
  { readWeekdayTimeWindowsConfig: time.weekdayTimeConfig.readWindowsConfig }
)
const whatsapp = loadOfferingSource(
  'kitchen/utils/ordering-whatsapp',
  'readKitchenOrderWhatsAppNotificationPolicy'
)
const policy = loadOfferingSource(
  'kitchen/utils/ordering-policy',
  'readKitchenOrderTypeConfig',
  {
    ...whatsapp,
    KitchenOrderContactFields: ['name', 'phone', 'email'],
    KitchenOrderTypes: [
      'collection',
      'delivery',
      'pre_order',
      'dine_in',
      'eat_in',
      'takeaway',
      'room_service',
    ],
  }
)
export const weekdayHoursConstraints = loadOfferingSource(
  'utils/weekday-time-constraints',
  'weekdayHoursWithin,intersectWeekdayHours',
  { weekdayTimeDays: core.weekdayTimeCore.days }
)
export const operatingHoursPolicy = hours
export const serviceHoursPolicy = loadOfferingSource(
  'kitchen/utils/service-hours',
  'resolveServiceHours,hoursWithinParent,serviceHoursSummary',
  { weekdayTimeDays: core.weekdayTimeCore.days, ...weekdayHoursConstraints }
)
export const testKitchenHours = () => ({
  source: 'custom',
  timezone: 'Europe/Zurich',
  windows: [
    { days: [...core.weekdayTimeCore.days], open: '00:00', close: '00:00' },
  ],
})
export const interactionValidation = loadOfferingSource(
  'kitchen/utils/interaction-validation',
  'requireKitchenInteractionChanges',
  {
    KitchenOrderTypes: [
      'collection',
      'delivery',
      'pre_order',
      'dine_in',
      'eat_in',
      'takeaway',
      'room_service',
    ],
  }
)
const records = loadOfferingSource(
  'kitchen/utils/offering-policy',
  'normalizeKitchenOfferings',
  { ...hours, ...policy }
)
export const loadOfferingContract = (transform) =>
  loadOfferingSource(
    'kitchen/utils/offerings',
    'readKitchenOffering,readKitchenOfferingRecords,kitchenOfferingData',
    { ...records, ...interactionValidation, isFirestoreDocumentId },
    transform
  )
export const offeringContract = loadOfferingContract()
const target = loadOfferingSource(
  'kitchen/server/offerings/target',
  'serverKitchenOfferingsTarget',
  {
    requireFirestoreDocumentId: (value) => {
      if (!isFirestoreDocumentId(value)) throw new Error('Invalid id')
      return value
    },
    defineFirestoreMutationTarget: (value) => value,
  }
)
export const offeringReads = loadOfferingSource(
  'kitchen/server/offerings/read',
  'readKitchenOfferings,readKitchenOfferingsInTransaction',
  {
    ...offeringContract,
    ...serviceHoursPolicy,
    resolveKitchenOperationHours: testKitchenHours,
    ...target,
    requireFirestoreDocumentId: (value) => {
      if (!isFirestoreDocumentId(value)) throw new Error('Invalid id')
      return value
    },
  }
)
export const offeringTargets = target
export function offeringHarness(records = []) {
  const children = new Map(
    records.map((row) => [
      row.id,
      offeringContract.kitchenOfferingData(structuredClone(row)),
    ])
  )
  return {
    children,
    values: () =>
      offeringContract.readKitchenOfferingRecords(
        [...children].map(([id, data]) => ({ id, data }))
      ),
    readAll: async (target, limit, after) =>
      [...children]
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .filter(([id]) => !after || id > after)
        .slice(0, limit)
        .map(([id, data]) => ({ id, data: structuredClone(data) })),
    write: (target, id, data) => {
      if (target.collectionPath.split('/').at(-1) !== 'offerings')
        throw new Error('Unexpected write target')
      const next = { ...children.get(id), ...structuredClone(data) }
      for (const [key, value] of Object.entries(next))
        if (value?.deleted === true) delete next[key]
      children.set(id, next)
    },
  }
}

export const offeringOverviewPolicy = loadOfferingSource(
  'kitchen/utils/offering-options',
  'kitchenOfferingOptions,offeringsForOption,offeringOptionEnabled,offeringOptionStatus,serviceOptionStatus',
  loadOfferingSource(
    'kitchen/utils/table-service',
    'tableServiceChannel,tableChannelEnabled'
  )
)

export const serviceOverviewProjection = loadOfferingSource(
  'kitchen/utils/service-overview',
  'serviceOverviewSnapshot',
  { ...serviceMenuPolicy, ...offeringOverviewPolicy }
)
