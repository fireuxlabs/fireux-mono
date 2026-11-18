export type { KitchenTableTab, KitchenTableTabStatus } from '../records/table-tab.ts'
export type { KitchenTableRound, KitchenTableRoundLine, KitchenTableRoundStatus } from '../records/table-round.ts'
export const KitchenTableTabStorage = { shape: 'scoped', path: 'kitchens/{kitchenId}/table_tabs/{tableTabId}', collection: 'table_tabs', parent: 'kitchen', idParam: 'tableTabId' } as const
export const KitchenTableRoundStorage = { shape: 'scoped-child', path: 'kitchens/{kitchenId}/table_tabs/{tableTabId}/rounds/{roundId}', collection: 'rounds', parent: 'table_tab', idParam: 'roundId' } as const
