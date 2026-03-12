import { defineEventHandler } from 'h3'
import { buildProjectMetaResponse } from 'fireux-core/runtime/server/utils/project-meta.ts'

export default defineEventHandler((event) =>
  buildProjectMetaResponse(event, {
    description:
      'Operating system for portfolios, properties, and built-environment operations.',
  })
)
