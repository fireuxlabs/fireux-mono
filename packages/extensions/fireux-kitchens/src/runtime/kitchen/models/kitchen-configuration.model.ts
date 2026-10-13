import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model.ts'

/** Existing Kitchen-wide capability configuration, separate from Kitchen identity. */
export type KitchenConfiguration = {
  theme?: WorkspaceTheme
  orders?: KitchenOrdersConfig
  tables?: KitchenTablesConfig
}

export type KitchenImageShade = 'light' | 'dark' | 'none'

export type KitchenOrdersConfig = {
  operation_hours?: WeekdayTimeWindowsConfig
  printing?: {
    ticket_device_id: string
  }
}

export type KitchenTablesConfig = {
  count: number
}
