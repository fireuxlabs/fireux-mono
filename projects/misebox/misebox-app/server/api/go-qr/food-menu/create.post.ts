import { $fetch } from 'ofetch'
import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'
import { goQrProviderBaseUrl } from '../../../utils/goQrProvider'

const maxFileSizeMb = 10
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024
const reservedDocumentSlugs = [
  'about',
  'admin',
  'api',
  'assets',
  'blog',
  'console',
  'dashboard',
  'docs',
  'food-menu',
  'get-started',
  'help',
  'pricing',
  'privacy',
  'products',
  'solutions',
  'terms',
]

type GoQrCreateResult = {
  ok: boolean
  slug: string
  path: string
  qr_path: string
  powered_by?: {
    name: string
    url: string
    logo_url?: string
  }
}

function fieldValue(parts: Awaited<ReturnType<typeof readMultipartFormData>>, name: string) {
  const part = parts?.find((entry) => entry.name === name)
  return part?.data ? part.data.toString('utf8').trim() : ''
}

export default defineEventHandler(async (event) => {
  const goQrBaseUrl = goQrProviderBaseUrl()
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((part) => part.name === 'file' && part.filename)
  const slug = normalizeSlug(fieldValue(parts, 'slug'))
  const validation = validatePublicSlug(slug, {
    label: 'Menu path',
    reservedScope: 'root',
    reserved: reservedDocumentSlugs,
  })

  if (!validation.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.message || 'Menu path is not valid',
    })
  }

  if (!filePart?.data?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu file is required',
    })
  }

  if (filePart.data.byteLength > maxFileSizeBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: `Max file size is ${maxFileSizeMb} MB`,
    })
  }

  const formData = new FormData()
  formData.append('slug', slug)
  formData.append('type', 'food-menu')
  formData.append(
    'file',
    new Blob([filePart.data], {
      type: String(filePart.type || 'application/octet-stream'),
    }),
    filePart.filename || 'menu'
  )

  const response = await $fetch<GoQrCreateResult>(`${goQrBaseUrl}/api/docs/create`, {
    method: 'POST',
    body: formData,
  })

  return {
    ...response,
    url: `${goQrBaseUrl}/${encodeURIComponent(response.slug)}`,
    qr_url: `${goQrBaseUrl}/${encodeURIComponent(response.slug)}/qr`,
    powered_by: response.powered_by || {
      name: 'Go QR',
      url: goQrBaseUrl,
      logo_url: `${goQrBaseUrl}/img/app/logo.png`,
    },
  }
})
