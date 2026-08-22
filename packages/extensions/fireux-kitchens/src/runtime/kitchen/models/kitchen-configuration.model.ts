import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type { CurrencyDisplayFormat } from '../../models/shared/currency-display.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model.ts'
import type { KitchenFulfilment } from './fulfilment.model.ts'

/** Existing Kitchen-wide capability configuration, separate from Kitchen identity. */
export type KitchenConfiguration = {
  theme?: WorkspaceTheme
  menus?: KitchenMenusConfig
  orders?: KitchenOrdersConfig
  tables?: KitchenTablesConfig
  fulfilment?: KitchenFulfilment
  integrations?: {
    sproochli?: SproochliAttachmentConfig
  }
}

export type KitchenImageShade = 'light' | 'dark' | 'none'

export type KitchenMenusConfig = {
  context?: string
  currency_format: CurrencyDisplayFormat
  show_currency: boolean
  available?: boolean
  primary_menu_id?: string
  specials_enabled?: boolean
  specials_menu_id?: string
  style?: Partial<PageStyle>
}

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
