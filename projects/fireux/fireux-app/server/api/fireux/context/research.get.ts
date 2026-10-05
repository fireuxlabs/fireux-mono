import { createHash } from 'node:crypto'
import { defineEventHandler, setResponseHeader } from 'h3'
import { readIndustryResearchContext } from 'fireux-ai/runtime/utils/industry-research-context'

export default defineEventHandler((event) => {
  const context = readIndustryResearchContext()
  setResponseHeader(event, 'cache-control', 'public, max-age=300')
  return {
    schemaVersion: 1,
    visibility: 'public',
    contextId: 'industry-capability-research',
    sourcePath: '/api/fireux/context/research',
    revision: createHash('sha256')
      .update(JSON.stringify(context))
      .digest('hex'),
    context,
  }
})
