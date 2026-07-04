import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'
import {
  compactMenuDetailRecord,
  menuDetailText,
  type MenuDetailFile,
} from './types.ts'

export const readMenuDocumentKind = (data: Record<string, unknown>) =>
  readRecordString(data, 'file_kind') ||
  readRecordString(data, 'kind')

export const readMenuFile = (
  data: Record<string, unknown>
): MenuDetailFile => {
  const file = readRecord(data.file)

  return {
    url: readRecordString(file, 'url'),
    name: readRecordString(file, 'name'),
    type: readRecordString(file, 'type'),
    storage_path: readRecordString(file, 'storage_path'),
  }
}

export const hasMenuFile = (file: MenuDetailFile) =>
  Boolean(file.url || file.name || file.type || file.storage_path)

export const compactMenuFile = (file: MenuDetailFile) =>
  compactMenuDetailRecord(file) as MenuDetailFile

export const menuFileKind = (options: {
  file: MenuDetailFile
  storedKind: string
}) =>
  documentKindFromFile({
    fileName: menuDetailText(options.file.name),
    contentType: menuDetailText(options.file.type),
    storedKind: options.storedKind,
  })
