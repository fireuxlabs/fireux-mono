import { createError, readMultipartFormData } from 'h3'

export type MultipartParts = Awaited<ReturnType<typeof readMultipartFormData>>

export type UploadedMultipartFile = {
  data: Buffer
  fileName: string
  contentType: string
}

export type UploadedMultipartFileOptions = {
  fieldName?: string
  label: string
  defaultFileName: string
  maxFileSizeMb: number
  allowedTypes?: readonly string[]
  extensionTypes?: Record<string, string>
  allowImageTypes?: boolean
  invalidTypeMessage: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function multipartField(parts: MultipartParts, name: string) {
  const part = parts?.find((entry) => entry.name === name)
  return part?.data ? part.data.toString('utf8').trim() : ''
}

export function safeUploadFileName(value: unknown, defaultName: string) {
  return (
    text(value || defaultName)
      .replace(/[^\w.-]+/g, '-')
      .replace(/^-+|-+$/g, '') || defaultName
  )
}

export function uploadFileExtension(fileName: string) {
  return fileName.toLowerCase().match(/\.[^.]+$/)?.[0] ?? ''
}

export function resolveUploadContentType(input: {
  fileName: string
  uploadedType: string
  allowedTypes?: readonly string[]
  extensionTypes?: Record<string, string>
  allowImageTypes?: boolean
}) {
  const uploadedType = text(input.uploadedType || 'application/octet-stream')
  const allowedTypes = new Set(input.allowedTypes ?? [])

  if (allowedTypes.has(uploadedType)) return uploadedType
  if (input.allowImageTypes && uploadedType.startsWith('image/')) {
    return uploadedType
  }

  return input.extensionTypes?.[uploadFileExtension(input.fileName)] ?? ''
}

export function readUploadedMultipartFile(
  parts: MultipartParts,
  options: UploadedMultipartFileOptions
): UploadedMultipartFile {
  const fieldName = options.fieldName ?? 'file'
  const part = parts?.find((entry) => entry.name === fieldName && entry.filename)

  if (!part?.data?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `${options.label} is required.`,
    })
  }

  const maxFileSizeBytes = options.maxFileSizeMb * 1024 * 1024
  if (part.data.byteLength > maxFileSizeBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: `Max file size is ${options.maxFileSizeMb} MB.`,
    })
  }

  const fileName = safeUploadFileName(part.filename, options.defaultFileName)
  const contentType = resolveUploadContentType({
    fileName,
    uploadedType: text(part.type || 'application/octet-stream'),
    allowedTypes: options.allowedTypes,
    extensionTypes: options.extensionTypes,
    allowImageTypes: options.allowImageTypes,
  })

  if (!contentType) {
    throw createError({
      statusCode: 415,
      statusMessage: options.invalidTypeMessage,
    })
  }

  return {
    data: part.data,
    fileName,
    contentType,
  }
}

export function readUploadedMultipartFiles(
  parts: MultipartParts,
  options: UploadedMultipartFileOptions
): UploadedMultipartFile[] {
  const fieldName = options.fieldName ?? 'file'
  const fileParts = parts?.filter((entry) => entry.name === fieldName && entry.filename) ?? []

  if (!fileParts.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `${options.label} is required.`,
    })
  }

  const maxFileSizeBytes = options.maxFileSizeMb * 1024 * 1024

  return fileParts.map((part, index) => {
    if (!part.data?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: `${options.label} ${index + 1} is empty.`,
      })
    }

    if (part.data.byteLength > maxFileSizeBytes) {
      throw createError({
        statusCode: 413,
        statusMessage: `Max file size is ${options.maxFileSizeMb} MB per file.`,
      })
    }

    const fileName = safeUploadFileName(
      part.filename,
      index ? `${options.defaultFileName}-${index + 1}` : options.defaultFileName
    )
    const contentType = resolveUploadContentType({
      fileName,
      uploadedType: text(part.type || 'application/octet-stream'),
      allowedTypes: options.allowedTypes,
      extensionTypes: options.extensionTypes,
      allowImageTypes: options.allowImageTypes,
    })

    if (!contentType) {
      throw createError({
        statusCode: 415,
        statusMessage: options.invalidTypeMessage,
      })
    }

    return {
      data: part.data,
      fileName,
      contentType,
    }
  })
}
