import { randomUUID } from 'node:crypto'
import { createError, readMultipartFormData, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readUploadedMultipartFile } from 'fireux-core/runtime/server/utils/uploads/multipart'
import {
  deleteStorageFileIfExists,
  saveStorageFileWithDownloadToken,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import { runFireuxAiDocumentExtraction } from 'fireux-ai/runtime/server/utils/document-ai.server'
import type { KitchenTeamDossierDraft } from '../../models/team-dossier.model.ts'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority.ts'

const DOSSIER_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    role: { type: 'string' },
    station: { type: 'string' },
    certifications: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['name', 'role', 'station', 'certifications', 'notes', 'warnings'],
} as const

const text = (value: unknown, maxLength = 500) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)
const strings = (value: unknown, maxItems = 20) =>
  (Array.isArray(value) ? value : [])
    .map((item) => text(item, 120))
    .filter(Boolean)
    .slice(0, maxItems)
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

function draftFrom(
  value: unknown,
  sourceFileName: string
): KitchenTeamDossierDraft {
  const source = record(value)
  return {
    name: text(source.name, 120),
    role: text(source.role, 120),
    station: text(source.station, 120),
    certifications: strings(source.certifications),
    notes: text(source.notes, 1_000),
    sourceFileName,
    warnings: strings(source.warnings),
  }
}

async function authorizeDossier(event: H3Event, kitchenId: string) {
  const actor = await readKitchenMutationActor(event)
  let ownerAppId = ''
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const kitchen = await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    ownerAppId = kitchen.ownerAppId
  })
  return { actor, ownerAppId }
}

export async function extractKitchenTeamDossier(
  event: H3Event,
  input: { kitchenId: string }
) {
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const { actor, ownerAppId } = await authorizeDossier(event, kitchenId)
  const parts = await readMultipartFormData(event)
  const file = readUploadedMultipartFile(parts, {
    label: 'Team member dossier',
    defaultFileName: 'team-member-dossier',
    maxFileSizeMb: 10,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    extensionTypes: {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    },
    invalidTypeMessage: 'Upload a PDF or image dossier.',
  })
  const intakeId = randomUUID()
  const objectPath = `apps/${ownerAppId}/kitchens/${kitchenId}/team-dossier-intake/${intakeId}/${file.fileName}`
  const saved = await saveStorageFileWithDownloadToken({
    objectPath,
    data: file.data,
    contentType: file.contentType,
    cacheControl: 'private, no-store, max-age=0',
  })

  try {
    const isPdf = file.contentType === 'application/pdf'
    const extraction = await runFireuxAiDocumentExtraction<
      KitchenTeamDossierDraft,
      KitchenTeamDossierDraft
    >({
      event,
      appId: actor.runtimeAppId,
      files: [
        {
          id: intakeId,
          file_name: file.fileName,
          file_url: saved.fileUrl,
          file_type: file.contentType,
          file_kind: isPdf ? 'pdf' : 'image',
        },
      ],
      taskId: intakeId,
      logScope: 'kitchen-team-dossier',
      buildRequest: (sourceFile) => ({
        input: isPdf
          ? {
              files: [
                {
                  id: sourceFile.id,
                  file_name: sourceFile.file_name,
                  file_url: sourceFile.file_url,
                  mime_type: sourceFile.file_type,
                },
              ],
              instruction:
                'Extract only explicit work information needed to prepare a Kitchen Team member draft. Return the person name, stated kitchen or hospitality role, stated station, named certifications, a concise factual experience summary, and warnings for missing or ambiguous fields. Do not infer age, gender, nationality, health, ethnicity, religion, family status, or other sensitive traits. Do not invent facts.',
            }
          : {
              images: [
                {
                  id: sourceFile.id,
                  file_name: sourceFile.file_name,
                  url: sourceFile.file_url,
                  detail: 'high',
                },
              ],
              instruction:
                'Read this Team member dossier image and extract only explicit work information needed to prepare a Kitchen Team member draft. Return the person name, stated kitchen or hospitality role, stated station, named certifications, a concise factual experience summary, and warnings for missing or ambiguous fields. Do not infer sensitive traits or invent facts.',
            },
        context: {
          domain: 'kitchen_team_dossier',
          kitchenId,
          sourceFileName: sourceFile.file_name,
          privacy:
            'Transient extraction for operator review. The source is deleted after this request.',
        },
        outputJsonSchema: DOSSIER_SCHEMA,
        outputSchema: {
          name: 'Person name or empty string',
          role: 'Explicit kitchen or hospitality role or empty string',
          station: 'Explicit kitchen station or empty string',
          certifications: ['Explicit certification'],
          notes: 'Concise factual experience summary or empty string',
          warnings: ['Missing or ambiguous field'],
        },
      }),
      readResult: (data) => {
        const draft = draftFrom(data, file.fileName)
        return {
          status: draft.name ? 'complete' : 'empty',
          reason: draft.name ? undefined : 'No person name was found.',
          part: draft,
          notes: draft.warnings,
          items_count: draft.name ? 1 : 0,
        }
      },
      mergeParts: (drafts, warnings) => {
        const draft = drafts[0] || draftFrom({}, file.fileName)
        return {
          ...draft,
          warnings: Array.from(new Set([...draft.warnings, ...warnings])),
        }
      },
    })

    if (!extraction.ok || !extraction.data || !extraction.data.name) {
      throw createError({
        statusCode: 422,
        statusMessage:
          extraction.reason || 'No person name was found in the dossier.',
      })
    }
    return {
      ok: true as const,
      draft: extraction.data,
    }
  } finally {
    await deleteStorageFileIfExists({
      bucketName: saved.bucketName,
      objectPath: saved.objectPath,
    })
  }
}
