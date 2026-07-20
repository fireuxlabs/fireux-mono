import { defineFireuxEntity } from 'fireux-core/runtime/models/core/entity.model.ts'
import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

// Concurrent edit — 2026-07-19 21:10 CEST — Pre-order WhatsApp pass: expose the shared Menu notification policy types.

/** Root Menu identity and public publication record. */
export const MenuStorage = {
  shape: 'root',
  path: 'menus/{menuId}',
  root: 'menus/{menuId}',
  collection: 'menus',
  rootCollection: 'menus',
  idParam: 'menuId',
} as const

export const MenuEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Menu',
  family: ['menu'],
  storage: 'root',
  status: 'confirmed',
  root: MenuStorage.root,
  notes: [
    'Menu owns stable public identity and publication state.',
    'A Menu may optionally resolve to a KitchenMenu through source.',
    'KitchenMenu owns operational content, sections, items, and ordering policy.',
  ],
})

export type MenuStatus = 'draft' | 'published' | 'archived'
export type MenuKind = 'menu' | 'doc'

export type MenuSource = {
  app_id: string
  kitchen_id: string
  menu_id: string
}

export type MenuDocument = {
  url: string
  name: string
  type: string
  storage_path: string
}

export type Menu = {
  id: string
  kind?: MenuKind
  name: string
  description?: string
  status: MenuStatus
  source?: MenuSource
  file_kind?: 'photo' | 'pdf' | 'document'
  file?: MenuDocument
  created: FireuxStamped['created'] & { at: FirebaseTimestamp }
  updated: FireuxStamped['updated'] & { at: FirebaseTimestamp }
}

export type MenuCreateInput = Omit<Menu, 'created' | 'updated'>
export type MenuUpdateInput = Partial<Omit<Menu, 'id' | 'created' | 'updated'>>

export type {
  MenuChoice,
  MenuDeliveryZone,
  MenuOrderAvailabilityPolicy,
  MenuOrderContactField,
  MenuOrderCustomerPolicy,
  MenuOrderDepositPolicy,
  MenuOrderFulfilmentPolicy,
  MenuOrderNotificationPolicy,
  MenuOrderingConfig,
  MenuOrderTypeConfig,
  MenuOrderWhatsAppNotificationPolicy,
  MenuPaymentMethod,
  MenuServiceHoursConfig,
  MenuServiceProfile,
} from './kitchen-menu.model'

export { MenuOrderContactFields } from './kitchen-menu.model'
