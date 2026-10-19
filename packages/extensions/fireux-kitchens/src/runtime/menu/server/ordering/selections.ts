import { createError } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { MenuOrderSelection } from '../../models/menu-order-selection.model'

const fail = (message: string): never => {
  throw createError({ statusCode: 409, statusMessage: message })
}
const ids = (value: unknown, limit: number) => {
  if (!Array.isArray(value) || value.length > limit)
    return fail('Invalid item choices.')
  const result = value
    .map((id) => requireFirestoreDocumentId(id, 'Choice id'))
    .sort()
  if (new Set(result).size !== result.length)
    return fail('Choose each option once.')
  return result
}
export function readMenuOrderSelections(value: unknown): MenuOrderSelection[] {
  if (!Array.isArray(value) || !value.length || value.length > 50)
    return fail('Choose between 1 and 50 menu items.')
  const seen = new Set<string>()
  return value.map((raw) => {
    if (
      !raw ||
      typeof raw !== 'object' ||
      Array.isArray(raw) ||
      Object.keys(raw).some(
        (key) =>
          ![
            'menuId',
            'sectionId',
            'itemId',
            'optionId',
            'extraIds',
            'groups',
            'bottle',
            'offeringIds',
            'quantity',
            'expectedUnitMinor',
          ].includes(key)
      )
    )
      return fail('Menu selection is invalid.')
    const sectionId = requireFirestoreDocumentId(raw.sectionId, 'Section id')
    const itemId = requireFirestoreDocumentId(raw.itemId, 'Item id')
    if (
      !Number.isInteger(raw.quantity) ||
      raw.quantity < 1 ||
      raw.quantity > 99
    )
      return fail('Choose a whole quantity from 1 to 99.')
    if (
      raw.bottle !== undefined &&
      !['deposit', 'exchange'].includes(raw.bottle)
    )
      return fail('Invalid bottle choice.')
    if (
      raw.expectedUnitMinor !== undefined &&
      (!Number.isSafeInteger(raw.expectedUnitMinor) ||
        raw.expectedUnitMinor < 0)
    )
      return fail('Invalid expected price.')
    let groups: Record<string, string[]> | undefined
    if (raw.groups !== undefined) {
      if (
        !raw.groups ||
        typeof raw.groups !== 'object' ||
        Array.isArray(raw.groups) ||
        Object.keys(raw.groups).length > 10
      )
        return fail('Invalid meal choices.')
      groups = Object.fromEntries(
        Object.entries(raw.groups)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([id, values]) => [
            requireFirestoreDocumentId(id, 'Group id'),
            ids(values, 100),
          ])
      )
    }
    const selection: MenuOrderSelection = {
      sectionId,
      itemId,
      quantity: raw.quantity,
      ...(raw.menuId !== undefined
        ? { menuId: requireFirestoreDocumentId(raw.menuId, 'Menu id') }
        : {}),
      ...(raw.optionId !== undefined && raw.optionId !== ''
        ? { optionId: requireFirestoreDocumentId(raw.optionId, 'Option id') }
        : {}),
      ...(raw.extraIds !== undefined
        ? { extraIds: ids(raw.extraIds, 100) }
        : {}),
      ...(groups ? { groups } : {}),
      ...(raw.bottle ? { bottle: raw.bottle } : {}),
      ...(raw.offeringIds !== undefined
        ? { offeringIds: ids(raw.offeringIds, 20) }
        : {}),
      ...(raw.expectedUnitMinor !== undefined
        ? { expectedUnitMinor: raw.expectedUnitMinor }
        : {}),
    }
    const {
      quantity: _quantity,
      expectedUnitMinor: _price,
      ...identity
    } = selection
    const key = JSON.stringify(identity)
    if (seen.has(key)) return fail('Combine repeated menu items.')
    seen.add(key)
    return selection
  })
}
