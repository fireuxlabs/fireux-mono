import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type MenuSourceUploadStatus =
  | 'uploaded'
  | 'extracting'
  | 'draft'
  | 'published'
  | 'archived'
export type MenuSourceUploadKind = 'photo' | 'pdf' | 'document' | 'url'
export type MenuSourceUploadFile = {
  id: string
  file_url: string
  file_name: string
  file_type: string
  file_kind: MenuSourceUploadKind
  storage_path: string
  sort_order: number
}

export type MenuSourceUpload = FireuxStamped & {
  id: string
  kitchen_id: string
  app_id: string
  provider: string
  tool: string
  storage_owner: string
  storage_app_id: string
  file_url: string
  file_name: string
  file_type: string
  file_kind: MenuSourceUploadKind
  source_url: string
  source_provider: string
  storage_path: string
  files: MenuSourceUploadFile[]
  files_count: number
  status: MenuSourceUploadStatus
}
