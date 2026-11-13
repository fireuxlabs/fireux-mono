/** App-selected ordering channels; omission enables none. */
export const OrderChannels = ['pos', 'kiosk', 'website', 'app', 'api'] as const
export type OrderChannel = (typeof OrderChannels)[number]
export type OrderingConfiguration = { channels: OrderChannel[] }
