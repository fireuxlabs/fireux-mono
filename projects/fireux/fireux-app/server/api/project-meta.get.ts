import { defineEventHandler } from 'h3'
import { buildProjectMetaResponse } from 'fireux-core/runtime/server/utils/project-meta.ts'

export default defineEventHandler((event) =>
  buildProjectMetaResponse(event, {
    description:
      'Platform operating system for ecosystems, apps, and project-level console workflows.',
  })
)
