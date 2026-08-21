import { aiDocumentProcessSourcesPrimitive } from './document/process-sources'
import { aiStructuredGenerateJsonPrimitive } from './structured/generate-json'

export const aiToolPrimitives = [
  aiStructuredGenerateJsonPrimitive,
  aiDocumentProcessSourcesPrimitive,
] as const
