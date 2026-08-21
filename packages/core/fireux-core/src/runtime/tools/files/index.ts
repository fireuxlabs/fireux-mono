import { defineFireuxPrimitive } from '../types'

const filePrimitive = (
  input: Omit<
    FireuxPrimitiveDefinition,
    'kind' | 'family' | 'execution' | 'surfaces'
  >
) =>
  defineFireuxPrimitive({
    kind: 'primitive',
    family: 'core.files',
    execution: {
      environment: 'server',
      authorization: 'required',
      confirmation: 'contextual',
    },
    surfaces: { human: false, ai: true },
    ...input,
  })

import type { FireuxPrimitiveDefinition } from '../types'

export const fileUploadAcceptPrimitive = filePrimitive({
  id: 'core.files.accept-upload',
  name: 'Accept an upload',
  description: 'Receive a bounded file from an authorized request.',
  problem: 'An authorized workflow needs to receive a file safely.',
  searchIntents: [
    { phrase: 'secure file upload', kind: 'solution', status: 'hypothesis' },
    {
      phrase: 'Nuxt multipart file upload',
      kind: 'implementation',
      status: 'hypothesis',
    },
    { phrase: 'receive uploaded file', kind: 'problem', status: 'hypothesis' },
  ],
  input: { required: ['multipartParts', 'policy'], extensible: false },
  result: { kind: 'UploadedMultipartFile' },
  ai: {
    baked: {
      purpose: 'Receive one authorized file under an explicit upload policy.',
      knows: ['The supplied multipart parts and upload policy.'],
      constraints: [
        'Do not infer authorization, ownership, storage destination or domain meaning.',
      ],
      evidence: [
        'Return the accepted file metadata or the validation failure.',
      ],
    },
    runtime: {
      accepted: true,
      required: ['multipartParts', 'policy'],
      optional: ['requestLabel'],
    },
  },
  implementation: {
    importPath: 'fireux-core/runtime/server/utils/uploads/multipart',
    exports: ['readUploadedMultipartFile'],
  },
  documentation: {
    slug: 'accept-upload',
    guide:
      'Use this server primitive when a Nuxt endpoint needs to receive one multipart file with a clear size and content policy.',
    seoDescription:
      'Accept a secure multipart file upload in Nuxt with FireUX Core.',
    example: `const parts = await readMultipartFormData(event)
const file = readUploadedMultipartFile(parts, {
  label: 'Source file',
  defaultFileName: 'source-file',
  maxFileSizeMb: 10,
  allowedTypes: ['application/pdf'],
  invalidTypeMessage: 'Upload a PDF.',
})`,
  },
})

export const fileUploadsAcceptPrimitive = filePrimitive({
  id: 'core.files.accept-uploads',
  name: 'Accept multiple uploads',
  description: 'Receive bounded files from an authorized request.',
  problem: 'An authorized workflow needs to receive several files safely.',
  searchIntents: [
    {
      phrase: 'multiple file upload',
      kind: 'solution',
      status: 'hypothesis',
    },
    {
      phrase: 'Nuxt multipart multiple files',
      kind: 'implementation',
      status: 'hypothesis',
    },
    {
      phrase: 'upload multiple documents',
      kind: 'problem',
      status: 'hypothesis',
    },
  ],
  input: { required: ['multipartParts', 'policy'], extensible: false },
  result: { kind: 'UploadedMultipartFile[]' },
  ai: {
    baked: {
      purpose:
        'Receive authorized files governed by one explicit upload policy.',
      knows: ['The supplied multipart parts and upload policy.'],
      constraints: [
        'Do not infer authorization, ownership, storage destination or domain meaning.',
      ],
      evidence: ['Return accepted file metadata and any validation failure.'],
    },
    runtime: {
      accepted: true,
      required: ['multipartParts', 'policy'],
      optional: ['requestLabel'],
    },
  },
  implementation: {
    importPath: 'fireux-core/runtime/server/utils/uploads/multipart',
    exports: ['readUploadedMultipartFiles'],
  },
  documentation: {
    slug: 'accept-uploads',
    guide:
      'Use this server primitive when one authorized request may contain several files governed by the same bounded policy.',
    seoDescription:
      'Accept multiple secure multipart file uploads in Nuxt with FireUX Core.',
    example: `const parts = await readMultipartFormData(event)
const files = readUploadedMultipartFiles(parts, {
  label: 'Menu file',
  defaultFileName: 'menu-file',
  maxFileSizeMb: 10,
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
})`,
  },
})

export const fileValidatePrimitive = filePrimitive({
  id: 'core.files.validate-file',
  name: 'Validate a file',
  description: 'Check its size, type, extension and required fields.',
  problem:
    'An uploaded file must be rejected unless it satisfies a known policy.',
  searchIntents: [
    { phrase: 'validate file upload', kind: 'solution', status: 'hypothesis' },
    {
      phrase: 'file size validation',
      kind: 'implementation',
      status: 'hypothesis',
    },
    {
      phrase: 'MIME type validation',
      kind: 'implementation',
      status: 'hypothesis',
    },
  ],
  input: { required: ['multipartParts', 'policy'], extensible: false },
  result: { kind: 'UploadedMultipartFile' },
  ai: {
    baked: {
      purpose: 'Enforce a supplied file policy before further processing.',
      knows: ['File metadata, bytes and the supplied validation policy.'],
      constraints: [
        'Do not weaken, expand or invent the owning domain policy.',
      ],
      evidence: [
        'Report the accepted metadata or the exact validation boundary.',
      ],
    },
    runtime: {
      accepted: true,
      required: ['multipartParts', 'policy'],
      optional: ['requestLabel'],
    },
  },
  implementation: {
    importPath: 'fireux-core/runtime/server/utils/uploads/multipart',
    exports: ['readUploadedMultipartFile'],
  },
  documentation: {
    slug: 'validate-file',
    guide:
      'Use the upload reader as the validation boundary before storage or document processing.',
    seoDescription:
      'Validate uploaded file size, MIME type and extension in a Nuxt server route with FireUX Core.',
    example: `const file = readUploadedMultipartFile(parts, {
  label: 'Menu file', maxFileSizeMb: 10,
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  defaultFileName: 'menu-file', invalidTypeMessage: 'Upload a PDF, JPEG or PNG.',
})`,
  },
})

export const documentClassifyPrimitive = filePrimitive({
  id: 'core.files.classify-document',
  name: 'Classify a document',
  description: 'Identify an image, PDF or other document source.',
  problem:
    'A workflow needs to choose processing based on an uploaded document type.',
  searchIntents: [
    { phrase: 'detect PDF or image', kind: 'problem', status: 'hypothesis' },
    {
      phrase: 'identify uploaded file type',
      kind: 'solution',
      status: 'hypothesis',
    },
    {
      phrase: 'document classification',
      kind: 'product',
      status: 'hypothesis',
    },
  ],
  input: { required: ['fileName', 'contentType'], extensible: false },
  result: { kind: 'DocumentKind' },
  ai: {
    baked: {
      purpose: 'Classify a file using its declared type and filename.',
      knows: ['The filename and declared content type.'],
      constraints: [
        'Do not infer document content or trust classification as authorization.',
      ],
      evidence: ['Return the resolved document kind.'],
    },
    runtime: {
      accepted: true,
      required: ['fileName', 'contentType'],
      optional: [],
    },
  },
  implementation: {
    importPath: 'fireux-core/runtime/server/utils/files/document-kind',
    exports: ['documentKindFromFile'],
  },
  documentation: {
    slug: 'classify-document',
    guide:
      'Use document classification after upload validation when later processing needs to distinguish source kinds.',
    seoDescription:
      'Classify an uploaded file as a photo, PDF or document in Nuxt with FireUX Core.',
    example: `const kind = documentKindFromFile({
  fileName: file.fileName,
  contentType: file.contentType,
})`,
  },
})

export const fileStorePrimitive = filePrimitive({
  id: 'core.files.store-file',
  name: 'Store a file',
  description:
    'Save an authorized file with an explicit storage path and policy.',
  problem: 'A validated file needs durable storage owned by its domain.',
  searchIntents: [
    {
      phrase: 'Firebase Storage upload',
      kind: 'integration',
      status: 'hypothesis',
    },
    { phrase: 'store uploaded file', kind: 'solution', status: 'hypothesis' },
    {
      phrase: 'Nuxt Firebase file upload',
      kind: 'implementation',
      status: 'hypothesis',
    },
  ],
  input: { required: ['objectPath', 'data', 'contentType'], extensible: false },
  result: { kind: 'SavedStorageFile' },
  ai: {
    baked: {
      purpose: 'Store validated bytes at an owner-selected storage path.',
      knows: ['The explicit object path, bytes and content type.'],
      constraints: [
        'Do not select ownership, invent a path or store before authorization and validation.',
      ],
      evidence: ['Return the saved object path, bucket and download metadata.'],
    },
    runtime: {
      accepted: true,
      required: ['objectPath', 'data', 'contentType'],
      optional: ['bucketName'],
    },
  },
  implementation: {
    importPath: 'fireux-core/runtime/server/utils/uploads/storage',
    exports: ['saveStorageFileWithDownloadToken'],
  },
  documentation: {
    slug: 'store-file',
    guide:
      'Use this server primitive after authorization and validation to save bytes at a domain-owned Firebase Storage path.',
    seoDescription:
      'Upload a validated file to Firebase Storage from a Nuxt server route with FireUX Core.',
    example: `const saved = await saveStorageFileWithDownloadToken({
  objectPath: \`uploads/\${ownerId}/\${file.fileName}\`,
  data: file.data,
  contentType: file.contentType,
})`,
  },
})

export const storedFileDeletePrimitive = filePrimitive({
  id: 'core.files.delete-stored-file',
  name: 'Delete a stored file',
  description: 'Remove a stored source when its lifecycle is complete.',
  problem:
    'An owned file must be removed when it is replaced or no longer required.',
  searchIntents: [
    {
      phrase: 'delete Firebase Storage file',
      kind: 'integration',
      status: 'hypothesis',
    },
    { phrase: 'remove uploaded file', kind: 'solution', status: 'hypothesis' },
    {
      phrase: 'file lifecycle cleanup',
      kind: 'implementation',
      status: 'hypothesis',
    },
  ],
  input: { required: ['objectPath'], extensible: false },
  result: { kind: 'DeletedStorageFile' },
  ai: {
    baked: {
      purpose:
        'Remove an explicitly owned stored file at the end of its lifecycle.',
      knows: ['The explicit object path and optional bucket.'],
      constraints: [
        'Do not infer a deletion target or ownership from filenames or URLs.',
      ],
      evidence: ['Return whether the owned object existed and was removed.'],
    },
    runtime: {
      accepted: true,
      required: ['objectPath'],
      optional: ['bucketName'],
    },
  },
  implementation: {
    importPath: 'fireux-core/runtime/server/utils/uploads/storage',
    exports: ['deleteStorageFileIfExists'],
  },
  documentation: {
    slug: 'delete-stored-file',
    guide:
      'Use this idempotent cleanup primitive when an owned upload is replaced, rejected or no longer needed.',
    seoDescription:
      'Safely delete an owned Firebase Storage file from a Nuxt server route with FireUX Core.',
    example: `await deleteStorageFileIfExists({
  objectPath: saved.objectPath,
  bucketName: saved.bucketName,
})`,
  },
})
