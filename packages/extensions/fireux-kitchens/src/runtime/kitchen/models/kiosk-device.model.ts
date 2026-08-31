export type KitchenKioskDeviceStatus = 'active' | 'revoked'

export type KitchenKioskDeviceRecord = {
  app_id: string
  kitchen_id: string
  kitchen_slug: string
  menu_id: string
  label: string
  status: KitchenKioskDeviceStatus
  session_hash: string
  expires_at: unknown
  revoked_at?: unknown
  revoked_by?: string
  created: unknown
  updated: unknown
}

export type KitchenKioskDeviceSummary = {
  id: string
  label: string
  menuId: string
  status: KitchenKioskDeviceStatus | 'expired'
  expiresAt: string
  current: boolean
  livePath: string
}
