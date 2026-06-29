import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'
import {
  compactMenuSurfaceRecord,
  menuSurfaceText,
  type MenuSurfaceFile,
} from './types.ts'

export const readMenuDocumentKind = (data: Record<string, unknown>) =>
  readRecordString(data, 'file_kind') ||
  readRecordString(data, 'kind')

export const readMenuFile = (
  data: Record<string, unknown>
): MenuSurfaceFile => {
  const file = readRecord(data.file)

  return {
    url: readRecordString(file, 'url'),
    name: readRecordString(file, 'name'),
    type: readRecordString(file, 'type'),
    storage_path: readRecordString(file, 'storage_path'),
  }
}

export const hasMenuFile = (file: MenuSurfaceFile) =>
  Boolean(file.url || file.name || file.type || file.storage_path)

export const compactMenuFile = (file: MenuSurfaceFile) =>
  compactMenuSurfaceRecord(file) as MenuSurfaceFile

export const menuFileKind = (options: {
  file: MenuSurfaceFile
  storedKind: string
}) =>
  documentKindFromFile({
    fileName: menuSurfaceText(options.file.name),
    contentType: menuSurfaceText(options.file.type),
    storedKind: options.storedKind,
  })
