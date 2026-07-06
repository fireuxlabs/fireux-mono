import type { MenuStatus } from '../../../../../../models/kitchen/menu/menu.model'

export type MenuQrTarget = {
  id: string
  label: string
  description: string
  path: string
  url: string
}

export type MenuQrPanel = {
  id: string
  label: string
  description: string
  status: MenuStatus
  summary: string
  editPath: string
  targets: MenuQrTarget[]
}
