import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { MenuSourceUploadStorage } from '../utils/menu-source-upload.ts'
export const MenuSourceUploadRecord = defineFireuxEntity({ kind: 'record', name: 'MenuSourceUpload', family: 'menu', identity: 'parent-scoped', authority: 'parent', appSupport: 'none', parent: 'Kitchen', scoped: MenuSourceUploadStorage.path })
