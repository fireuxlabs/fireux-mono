import type { KitchenOrderTypeConfig } from '../models/ordering.model'

export type TableServiceChannel = 'staff_pos' | 'table_qr'

export function tableServiceChannel(
  option: string
): TableServiceChannel | undefined {
  return option === 'table_service'
    ? 'staff_pos'
    : option === 'qr_tables'
      ? 'table_qr'
      : undefined
}

/** A table setup belongs to one entry channel, independently of its On/Off state. */
export function tableChannelEnabled(
  config: Pick<KitchenOrderTypeConfig, 'type' | 'table_channels'>,
  channel: string
) {
  if (config.type !== 'dine_in') return true
  if (channel !== 'staff_pos' && channel !== 'table_qr') return false
  return config.table_channels?.[channel] === true
}

/** Channel identity stays fixed when this independent setup is switched off. */
export function configureTableChannel(
  channel: TableServiceChannel,
  enabled: boolean
) {
  return {
    enabled,
    table_channels: {
      staff_pos: channel === 'staff_pos',
      table_qr: channel === 'table_qr',
    },
  }
}
