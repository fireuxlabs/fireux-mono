import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind'
import { menuDocumentFilePath } from '../../utils/navigation/route'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read'
import {
  compactMenuPayloadRecord,
  menuPayloadText,
  type MenuPayloadFile,
} from './types.ts'

export const readMenuDocumentKind = (data: Record<string, unknown>) =>
  readRecordString(readRecord(data.doc), 'type')

export const readMenuFile = (
  data: Record<string, unknown>,
  menuId: string,
  directoryKitchenSlug?: string
): MenuPayloadFile => {
  const file = readRecord(data.doc)
  let url = readRecordString(file, 'url')
  if (readRecordString(file, 'storage_path'))
    url = menuDocumentFilePath({ menuId, kitchenSlug: directoryKitchenSlug })
  else if (!/^https?:\/\//i.test(url)) url = ''
  return {
    url,
    name: readRecordString(file, 'name'),
    type: readRecordString(file, 'type'),
  }
}

export const hasMenuFile = (file: MenuPayloadFile) =>
  Boolean(file.url || file.name || file.type)

export const compactMenuFile = (file: MenuPayloadFile) =>
  compactMenuPayloadRecord(file) as MenuPayloadFile

export const menuFileKind = (options: {
  file: MenuPayloadFile
  storedKind: string
}) =>
  documentKindFromFile({
    fileName: menuPayloadText(options.file.name),
    contentType: menuPayloadText(options.file.type),
    storedKind: options.storedKind,
  })
