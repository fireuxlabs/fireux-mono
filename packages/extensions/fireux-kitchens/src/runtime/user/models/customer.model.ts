import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type CustomerSavedAddress = { id: string; label: string; address: string; place_id: string; delivery_note: string; is_default: boolean }
export type CustomerPreferences = { name: string; phone: string; allergy_note: string; default_delivery_address: string; saved_addresses: CustomerSavedAddress[] }
export type Customer = FireuxStamped & { id: string; kind: 'customer'; preferences: CustomerPreferences }
