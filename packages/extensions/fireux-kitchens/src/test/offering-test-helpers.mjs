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
      children.set(id, { ...children.get(id), ...structuredClone(data) })
    },
  }
}
