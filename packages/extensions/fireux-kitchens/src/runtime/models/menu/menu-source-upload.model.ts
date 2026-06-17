import { defineFireuxEntity } from 'fireux-core/runtime/models/core/entity.model.ts'
import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export const MenuSourceUploadStorage = {
  shape: 'scoped',
  scoped: 'apps/{appId}/kitchens/{kitchenId}/menu-uploads/{uploadId}',
  path: 'apps/{appId}/kitchens/{kitchenId}/menu-uploads/{uploadId}',
  collection: 'menu-uploads',
  parent: 'kitchen',
  idParam: 'uploadId',
} as const

export const MenuSourceUploadRecord = defineFireuxEntity({
  kind: 'record',
  name: 'MenuSourceUpload',
  family: 'menu',
  storage: 'scoped',
  status: 'confirmed',
  parent: 'Kitchen',
  scoped: MenuSourceUploadStorage.path,
  notes: [
    'MenuSourceUpload stores the raw uploaded source for a Kitchen.',
    'It can produce or update a Menu later, but it is not the Menu entity.',
  ],
})

export type MenuSourceUploadStatus =
  | 'uploaded'
  | 'extracting'
  | 'draft'
  | 'published'
  | 'archived'

export type MenuSourceUploadKind = 'photo' | 'pdf' | 'document'

export const MenuSourceUploadModel = {
  id: '' as string,
  kitchen_id: '' as string,
  app_id: '' as string,
  provider: '' as string,
  tool: '' as string,
  storage_owner: '' as string,
  storage_app_id: '' as string,
  file_url: '' as string,
  file_name: '' as string,
  file_type: '' as string,
  file_kind: 'document' as MenuSourceUploadKind,
  storage_path: '' as string,
  status: 'uploaded' as MenuSourceUploadStatus,
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
} as const

type MutableModel<T> = {
  -readonly [K in keyof T]: T[K]
}

export type MenuSourceUpload = MutableModel<typeof MenuSourceUploadModel>
