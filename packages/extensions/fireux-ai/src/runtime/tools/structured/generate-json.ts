import { defineFireuxPrimitive } from 'fireux-core/runtime/tools/types'

export const aiStructuredGenerateJsonPrimitive = defineFireuxPrimitive({
  kind: 'primitive',
  id: 'ai.structured.generate-json',
  family: 'ai.structured',
  name: 'Generate structured information',
  description: 'Turn supplied content into schema-checked JSON.',
  problem:
    'Unstructured text, images or documents need a predictable data shape.',
  searchIntents: [
    {
      phrase: 'extract structured data with AI',
      kind: 'solution',
      status: 'hypothesis',
    },
    {
      phrase: 'AI JSON schema output',
      kind: 'implementation',
      status: 'hypothesis',
    },
    {
      phrase: 'convert document to JSON',
      kind: 'problem',
      status: 'hypothesis',
    },
  ],
  input: {
    required: ['appId', 'input', 'outputJsonSchema'],
    extensible: true,
  },
  result: { kind: 'FireuxAiResponse<T>' },
  execution: {
    environment: 'server',
    authorization: 'contextual',
    confirmation: 'contextual',
  },
  surfaces: { human: false, ai: true },
  ai: {
    baked: {
      purpose: 'Generate schema-checked information from supplied content.',
      knows: [
        'Only the supplied input, instructions, context and output schema.',
      ],
      constraints: [
        'Do not choose domain policy, authorization, persistence or confirmation behavior.',
      ],
      evidence: [
        'Return provider outcome, structured data and usage metadata.',
      ],
    },
    runtime: {
      accepted: true,
      required: ['input', 'outputJsonSchema'],
      optional: ['instructions', 'context', 'model', 'timeoutMs'],
    },
  },
  implementation: {
    importPath: 'fireux-ai/runtime/server/utils/fireux-ai.server',
    exports: ['useFireuxAi'],
  },
  documentation: {
    slug: 'generate-structured-information',
    guide:
      'Use this provider-neutral primitive after the owning domain supplies instructions, context and a JSON schema. The owning tool validates and decides whether the result may be saved.',
    seoDescription:
      'Generate schema-checked JSON from supplied content with FireUX AI.',
    example: `const ai = useFireuxAi(event)
const response = await ai.generateJson({
  appId,
  task: 'extract_structured_data',
  input: { source, instruction },
  outputJsonSchema,
})`,
  },
})
