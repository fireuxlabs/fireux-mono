import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model.ts'
import type { KitchenFulfilment } from './fulfilment.model.ts'

/** Existing Kitchen-wide capability configuration, separate from Kitchen identity. */
export type KitchenConfiguration = {
  theme?: WorkspaceTheme
  orders?: KitchenOrdersConfig
  tables?: KitchenTablesConfig
  fulfilment?: KitchenFulfilment
  integrations?: {
    sproochli?: SproochliAttachmentConfig
  }
}

export type KitchenImageShade = 'light' | 'dark' | 'none'

export type KitchenOrdersConfig = {
  modes?: string[]
  default_lead_time_minutes?: number
  acceptance_required?: boolean
  operation_hours?: WeekdayTimeWindowsConfig
  printing?: {
    ticket_device_id: string
  }
}

export type KitchenTablesConfig = {
  count: number
}

export type KitchenConfigurationUpdate = Partial<KitchenConfiguration> & {
  'orders.operation_hours'?: WeekdayTimeWindowsConfig | null
  'orders.printing'?: KitchenOrdersConfig['printing'] | null
}
