export type KitchenTestIntent = {
  action: 'create' | 'read' | 'update' | 'delete' | 'none'
  recordId: string
  value: string
  message: string
}
