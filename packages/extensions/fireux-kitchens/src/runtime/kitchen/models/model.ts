import type {
  FireuxCreatedStamp,
  FireuxUpdatedStamp,
} from 'fireux-core/runtime/models/utils/stamps.model'
import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'

export type KitchenIdentitySource = 'user' | 'place'
export type KitchenStatus = 'active' | 'inactive' | 'archived'
export type KitchenIdentity = {
  source?: KitchenIdentitySource
  slug: string
  status: KitchenStatus
  visibility: boolean
}

/** Canonical Kitchen fields admitted by readKitchenDocument; Place is separate. */
export type Kitchen = {
  id: string
  identity: KitchenIdentity
  context?: string
  guidance_ids?: string[]
  created: FireuxCreatedStamp
  updated?: FireuxUpdatedStamp & { app_id?: string }
  theme?: WorkspaceTheme
  orders?: {
    operation_hours?: WeekdayTimeWindowsConfig
    printing?: { ticket_device_id: string }
  }
  services?: { title?: string; item_images?: boolean }
  tables?: { count: number }
}
