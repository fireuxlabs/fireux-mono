import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind'
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
  readRecordString(data, 'file_kind') ||
  readRecordString(data, 'kind')

export const readMenuFile = (
  data: Record<string, unknown>
): MenuPayloadFile => {
  const file = readRecord(data.file)

  return {
    url: readRecordString(file, 'url'),
    name: readRecordString(file, 'name'),
    type: readRecordString(file, 'type'),
    storage_path: readRecordString(file, 'storage_path'),
  }
}

export const hasMenuFile = (file: MenuPayloadFile) =>
  Boolean(file.url || file.name || file.type || file.storage_path)

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
