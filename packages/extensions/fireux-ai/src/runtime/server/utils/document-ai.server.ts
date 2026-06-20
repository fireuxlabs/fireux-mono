import type { H3Event } from 'h3'
import type { FireuxAiRequest } from '../../types/ai'
import { useFireuxAi } from './fireux-ai.server'

export type FireuxAiDocumentSourceFile = {
  id: string
  file_name: string
  file_url: string
  file_type?: string
  file_kind?: string
  sort_order?: number
}

export type FireuxAiDocumentFileStatus = 'complete' | 'empty' | 'failed'

export type FireuxAiDocumentFileResult = {
  id: string
  file_name: string
  status: FireuxAiDocumentFileStatus
  reason?: string
  text_excerpt?: string
  sections_count: number
  items_count: number
}

export type FireuxAiDocumentExtractionResult<TData> = {
  ok: boolean
  data?: TData
  reason?: string
  provider?: string
  model?: string
  files: FireuxAiDocumentFileResult[]
}

type FireuxAiDocumentRequest = Omit<
  FireuxAiRequest,
  'appId' | 'model' | 'task'
>

type FireuxAiDocumentReadResult<TPart> = {
  status: Exclude<FireuxAiDocumentFileStatus, 'failed'>
  reason?: string
  part: TPart
  notes?: string[]
  sections_count?: number
  items_count?: number
}

type FireuxAiDocumentExtractionOptions<TPart, TData> = {
  event: H3Event
  appId: string
  model?: string
  files: FireuxAiDocumentSourceFile[]
  taskId: string
  logScope?: string
  buildRequest: (file: FireuxAiDocumentSourceFile) => FireuxAiDocumentRequest
  readResult: (
    data: unknown,
    file: FireuxAiDocumentSourceFile
  ) => FireuxAiDocumentReadResult<TPart>
  mergeParts: (parts: TPart[], notes: string[]) => TData
}

const text = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => text(value).slice(0, 1200)

export async function runFireuxAiDocumentExtraction<TPart, TData>(
  options: FireuxAiDocumentExtractionOptions<TPart, TData>
): Promise<FireuxAiDocumentExtractionResult<TData>> {
  const files = options.files.filter((file) => text(file.file_url))

  if (!files.length) {
    return {
      ok: false,
      reason: 'No source files have downloadable URLs.',
      files: [],
    }
  }

  const ai = useFireuxAi(options.event)
  const fileResults: FireuxAiDocumentFileResult[] = []
  const parts: TPart[] = []
  const notes: string[] = []
  let provider: FireuxAiDocumentExtractionResult<TData>['provider']
  let model: FireuxAiDocumentExtractionResult<TData>['model']

  for (const file of files) {
    console.info(`[${options.logScope || 'fireux-ai-document'}] extracting file`, {
      taskId: options.taskId,
      fileId: file.id,
      fileName: file.file_name,
      model: options.model,
    })

    const response = await ai.generateJson<unknown>({
      appId: options.appId,
      task: 'extract_structured_data',
      model: options.model,
      ...options.buildRequest(file),
    })

    provider ||= response.provider
    model ||= response.model

    if (!response.ok) {
      console.warn(
        `[${options.logScope || 'fireux-ai-document'}] file extraction failed`,
        {
          taskId: options.taskId,
          fileId: file.id,
          reason: response.reason,
        }
      )
      fileResults.push({
        id: file.id,
        file_name: file.file_name,
        status: 'failed',
        reason: response.reason || 'AI extraction failed for this file.',
        text_excerpt: excerpt(response.text),
        sections_count: 0,
        items_count: 0,
      })
      continue
    }

    const result = options.readResult(response.data, file)
    if (result.status === 'complete') {
      parts.push(result.part)
    }
    notes.push(...(result.notes || []).map(text).filter(Boolean))

    fileResults.push({
      id: file.id,
      file_name: file.file_name,
      status: result.status,
      reason: result.reason,
      sections_count: result.sections_count || 0,
      items_count: result.items_count || 0,
    })

    console.info(
      `[${options.logScope || 'fireux-ai-document'}] file extraction complete`,
      {
        taskId: options.taskId,
        fileId: file.id,
        status: result.status,
        sections: result.sections_count || 0,
        items: result.items_count || 0,
      }
    )
  }

  if (!parts.length) {
    const failedFiles = fileResults.filter((file) => file.status === 'failed')
    const nonFailedFiles = fileResults.filter((file) => file.status !== 'failed')

    if (nonFailedFiles.length) {
      return {
        ok: true,
        provider,
        model,
        files: fileResults,
        data: options.mergeParts([], notes.length ? notes : ['no visible content']),
      }
    }

    return {
      ok: false,
      reason: failedFiles.length
        ? 'AI extraction failed for every source file.'
        : 'AI extraction returned no content from any source file.',
      provider,
      model,
      files: fileResults,
    }
  }

  return {
    ok: true,
    provider,
    model,
    files: fileResults,
    data: options.mergeParts(parts, notes),
  }
}
