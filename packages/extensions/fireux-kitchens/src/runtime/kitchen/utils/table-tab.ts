export type { KitchenTableTab, KitchenTableTabStatus } from '../models/table-tab.model.ts'
export type { KitchenTableRound, KitchenTableRoundLine, KitchenTableRoundStatus } from '../models/table-round.model.ts'
export const KitchenTableTabStorage = { shape: 'scoped', path: 'kitchens/{kitchenId}/table_tabs/{tableTabId}', collection: 'table_tabs', parent: 'kitchen', idParam: 'tableTabId' } as const
export const KitchenTableRoundStorage = { shape: 'scoped-child', path: 'kitchens/{kitchenId}/table_tabs/{tableTabId}/rounds/{roundId}', collection: 'rounds', parent: 'table_tab', idParam: 'roundId' } as const
