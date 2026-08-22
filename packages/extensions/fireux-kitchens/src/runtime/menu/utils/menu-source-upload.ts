import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { MenuSourceUpload } from '../models/menu-source-upload.model'

export type * from '../models/menu-source-upload.model'
export const MenuSourceUploadStorage = { shape: 'scoped', scoped: 'kitchens/{kitchenId}/menu-uploads/{uploadId}', path: 'kitchens/{kitchenId}/menu-uploads/{uploadId}', collection: 'menu-uploads', parent: 'kitchen', idParam: 'uploadId' } as const
export const MenuSourceUploadDefaults: MenuSourceUpload = { id: '', kitchen_id: '', app_id: '', provider: '', tool: '', storage_owner: '', storage_app_id: '', file_url: '', file_name: '', file_type: '', file_kind: 'document', source_url: '', source_provider: '', storage_path: '', files: [], files_count: 0, status: 'uploaded', created: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['created']['by'], app_id: '' as FireuxStamped['created']['app_id'] }, updated: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['updated']['by'] } }
