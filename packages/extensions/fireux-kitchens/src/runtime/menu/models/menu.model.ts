import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type MenuStatus = 'draft' | 'published' | 'archived'
export type MenuKind = 'menu' | 'doc'
export type MenuSource = { app_id: string; kitchen_id: string; menu_id: string }
export type MenuDocument = { url: string; name: string; type: string; storage_path: string }

export type Menu = FireuxStamped & {
  id: string
  kind?: MenuKind
  name: string
  description?: string
  status: MenuStatus
  source?: MenuSource
  file_kind?: 'photo' | 'pdf' | 'document'
  file?: MenuDocument
}
