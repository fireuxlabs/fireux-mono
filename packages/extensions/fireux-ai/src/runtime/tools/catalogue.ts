import { aiDocumentProcessSourcesPrimitive } from './document/process-sources'
import { aiStructuredGenerateJsonPrimitive } from './structured/generate-json'
import { aiImageGeneratePrimitive } from './image/generate'

export const aiToolPrimitives = [
  aiStructuredGenerateJsonPrimitive,
  aiDocumentProcessSourcesPrimitive,
  aiImageGeneratePrimitive,
] as const
