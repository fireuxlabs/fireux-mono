import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read'
import { MenuSourceUploadStorage } from '../../models/menu-source-upload.model.ts'

export const menuDocumentContentTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]

/** Only Kitchen Menu uploads may be read with the server's bucket credentials. */
export function isKitchenMenuDocumentPath(
  objectPath: string,
  kitchenId: string,
  kitchen: Record<string, unknown>
) {
  const parts = objectPath.split('/')
  if (
    parts.some(
      (part) => !part || part === '.' || part === '..' || part.includes('\\')
    )
  )
    return false

  // Older uploads lived under the App which created or managed this Kitchen.
  if (parts[0] === 'apps') {
    const appId = parts[1]
    const createdIn = readRecordString(readRecord(kitchen.created), 'app_id')
    const management = readRecord(kitchen.management)
    const managedBy =
      management.mode === 'app' ? readRecordString(management, 'app_id') : ''
    if (appId !== createdIn && appId !== managedBy) return false
    parts.splice(0, 2)
  }
  return (
    parts.length === 6 &&
    parts[0] === 'kitchens' &&
    parts[1] === kitchenId &&
    parts[2] === MenuSourceUploadStorage.collection &&
    parts[4] === 'source'
  )
}
