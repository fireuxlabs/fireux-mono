import type { KitchenOrderType } from '../../kitchen/utils/order.ts'
import type { MenuManifest } from './menu-detail.model.ts'

export type MenuPreviewOrderChoice = {
  value: string
  label: string
  orderType?: KitchenOrderType
}

export type MenuStaffPosPreview = {
  menu: MenuManifest
  choices: MenuPreviewOrderChoice[]
  selectedChoice: string
}
