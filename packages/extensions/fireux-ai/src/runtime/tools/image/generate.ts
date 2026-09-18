import { defineFireuxPrimitive } from 'fireux-core/runtime/tools/types'

export const aiImageGeneratePrimitive = defineFireuxPrimitive({
  kind: 'primitive',
  id: 'ai.image.generate',
  family: 'ai.image',
  name: 'Generate image',
  description: 'Generate one square WebP image from a supplied prompt.',
  problem: 'An authorised domain needs artwork for a record without an image.',
  searchIntents: [
    { phrase: 'generate an image', kind: 'solution', status: 'hypothesis' },
  ],
  input: { required: ['prompt'], extensible: false },
  result: { kind: 'Image bytes, content type, provider, model and usage' },
  execution: {
    environment: 'server',
    authorization: 'contextual',
    confirmation: 'contextual',
  },
  surfaces: { human: false, ai: true },
  ai: {
    baked: {
      purpose: 'Generate artwork from a domain-owned prompt.',
      knows: ['Only the supplied prompt.'],
      constraints: [
        'The caller owns authorization, persistence and image replacement policy.',
      ],
      evidence: ['Return validated WebP bytes and provider metadata.'],
    },
    runtime: { accepted: true, required: ['prompt'], optional: [] },
  },
  implementation: {
    importPath: 'fireux-ai/runtime/server/utils/image-generation.server',
    exports: ['generateFireuxImage'],
  },
  documentation: {
    slug: 'generate-image',
    guide:
      'Call from an authorised server command. Uses the App AI credential in app mode. The domain supplies the prompt and saves the returned bytes. FIREUX_AI_IMAGE_MODEL overrides the image model independently of the text model.',
    seoDescription: 'Generate a square image with FireUX AI.',
    example: 'const image = await generateFireuxImage(event, { prompt })',
  },
})
