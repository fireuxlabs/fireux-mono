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

/** Existing dine-in configurations retain their two established entry channels. */
export function tableChannelEnabled(
  config: Pick<KitchenOrderTypeConfig, 'type' | 'table_channels'>,
  channel: string
) {
  if (config.type !== 'dine_in') return true
  if (channel !== 'staff_pos' && channel !== 'table_qr') return false
  return (
    config.table_channels === undefined ||
    config.table_channels[channel] === true
  )
}

/** Change one entry channel without enabling or disabling its sibling. */
export function configureTableChannel(
  current: (KitchenOrderTypeConfig & { enabled: boolean }) | undefined,
  channel: TableServiceChannel,
  enabled: boolean
) {
  const table_channels = {
    staff_pos: Boolean(
      current?.enabled && tableChannelEnabled(current, 'staff_pos')
    ),
    table_qr: Boolean(
      current?.enabled && tableChannelEnabled(current, 'table_qr')
    ),
    [channel]: enabled,
  }
  return {
    table_channels,
    enabled: table_channels.staff_pos || table_channels.table_qr,
  }
}
