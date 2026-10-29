import { createError, defineEventHandler } from 'h3'
import { uploadProtectedImage } from 'fireux-core/runtime/server/utils/uploads/image'
import { requireBlogAuthor } from '../../../blog/server/authoring'

export default defineEventHandler((event) =>
  uploadProtectedImage(event, async (path) => {
    const match = /^blogs\/([a-z0-9-]+)\/(?:featured|social)\.jpg$/.exec(path)
    if (!match)
      throw createError({
        statusCode: 400,
        statusMessage: 'Blog image target is invalid.',
      })
    await requireBlogAuthor(event, match[1])
  })
)
