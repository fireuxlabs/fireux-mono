import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import {
  multipartField,
  readUploadedMultipartFile,
} from 'fireux-core/runtime/server/utils/uploads/multipart'
import { saveKitchenDocumentMenu } from '../../../../menu/server/document/save'

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  if (
    parts?.filter((part) => part.name === 'file' && part.filename).length !== 1
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose one PDF or image.',
    })
  const file = readUploadedMultipartFile(parts, {
    label: 'Menu document',
    defaultFileName: 'menu',
    maxFileSizeMb: 10,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    invalidTypeMessage: 'Choose a PDF, JPG, PNG or WebP.',
  })
  return saveKitchenDocumentMenu(event, {
    kitchenId: multipartField(parts, 'kitchenId'),
    menuId: multipartField(parts, 'menuId'),
    claimSecret: multipartField(parts, 'claimSecret') || undefined,
    revision: multipartField(parts, 'revision'),
    venueName: multipartField(parts, 'venueName'),
    files: [file],
    publish: true,
  })
})
