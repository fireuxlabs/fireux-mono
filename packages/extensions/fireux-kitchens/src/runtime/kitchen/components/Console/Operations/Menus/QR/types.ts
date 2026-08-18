import type { MenuStatus } from '../../../../../../menu/models/menu.model.ts'

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
