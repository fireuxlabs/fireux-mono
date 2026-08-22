import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { MenuItem, MenuItemAddOnOption, MenuItemPriceOption } from '../models/menu-item.model'

export type * from '../models/menu-item.model'

export const MenuItemStorage = { shape: 'scoped', path: 'kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}', collection: 'items', parent: 'menu-section', idParam: 'itemId' } as const
export const MenuItemDefaults: MenuItem = { id: '', kitchen_id: '', menu_id: '', section_id: '', dish_id: '', price: 0, price_options: [], add_ons: [], status: 'active', sort_order: 0, created: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['created']['by'], app_id: '' as FireuxStamped['created']['app_id'] }, updated: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['updated']['by'] } }
export type MenuItemCreateInput = Omit<MenuItem, 'created' | 'updated'>
export type MenuItemUpdateInput = Partial<Omit<MenuItem, 'id' | 'created' | 'updated' | 'kitchen_id' | 'menu_id' | 'section_id' | 'dish_id'>>

const text = (value: unknown) => String(value ?? '').trim()
const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
export function normalizeMenuItemPriceOptions(value: unknown): MenuItemPriceOption[] {
  if (!Array.isArray(value)) return []
  return value.map((raw) => { const data = record(raw); const label = text(data.label); const match = label.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-ZäöüÄÖÜ]+)?/); const quantity = number(data.quantity) || (match ? number(match[1]?.replace(',', '.')) : 0); const unit = text(data.unit) || text(match?.[2]); return { label: label || [quantity || '', unit].filter(Boolean).join(' '), quantity, unit, price: number(data.price) } }).filter(option => option.label && option.price > 0)
}
export function normalizeMenuItemAddOns(value: unknown): MenuItemAddOnOption[] {
  if (!Array.isArray(value)) return []
  return value.map((raw, index) => { const data = record(raw); const label = text(data.label); const rawPrice = data.price === null || data.price === undefined || text(data.price) === '' ? -1 : number(data.price); return { id: text(data.id) || label.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `add-on-${index + 1}`, label, price: rawPrice } }).filter(option => option.id && option.label && option.price >= 0)
}
