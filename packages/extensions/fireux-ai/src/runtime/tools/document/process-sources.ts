import { defineFireuxPrimitive } from 'fireux-core/runtime/tools/types'

export const aiDocumentProcessSourcesPrimitive = defineFireuxPrimitive({
  kind: 'primitive',
  id: 'ai.document.process-sources',
  family: 'ai.document',
  name: 'Process document sources',
  description:
    'Process multiple document sources and report complete, empty and failed results.',
  problem:
    'A domain workflow needs reliable per-file outcomes when interpreting several sources.',
  searchIntents: [
    {
      phrase: 'process multiple documents with AI',
      kind: 'solution',
      status: 'hypothesis',
    },
    {
      phrase: 'batch document data extraction',
      kind: 'product',
      status: 'hypothesis',
    },
    {
      phrase: 'AI document extraction error handling',
      kind: 'implementation',
      status: 'hypothesis',
    },
  ],
  input: {
    required: ['files', 'buildRequest', 'readResult', 'mergeParts'],
    extensible: true,
  },
  result: { kind: 'FireuxAiDocumentExtractionResult<TData>' },
  execution: {
    environment: 'server',
    authorization: 'contextual',
    confirmation: 'contextual',
  },
  surfaces: { human: false, ai: true },
  ai: {
    baked: {
      purpose:
        'Process bounded document sources with explicit per-file outcomes.',
      knows: [
        'The supplied files and caller-owned request, reader and merge policies.',
      ],
      constraints: [
        'Do not invent domain extraction instructions or a merge policy.',
        'Do not hide empty or failed file outcomes.',
      ],
      evidence: [
        'Return complete, empty or failed evidence for every source file.',
      ],
    },
    runtime: {
      accepted: true,
      required: ['files', 'buildRequest', 'readResult', 'mergeParts'],
      optional: ['taskId', 'model', 'fileTimeoutMs', 'logScope'],
    },
  },
  implementation: {
    importPath: 'fireux-ai/runtime/server/utils/document-ai.server',
    exports: ['runFireuxAiDocumentExtraction'],
  },
  documentation: {
    slug: 'process-document-sources',
    guide:
      'Use this orchestration primitive when a domain tool supplies file-specific prompts, result readers and its own merge policy.',
    seoDescription:
      'Process multiple documents with structured AI extraction and per-file results.',
    example: `const extraction = await runFireuxAiDocumentExtraction({
  event, appId, files, taskId,
  buildRequest,
  readResult,
  mergeParts,
})`,
  },
})
