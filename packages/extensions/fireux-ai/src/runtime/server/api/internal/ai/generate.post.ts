import { defineEventHandler, readBody } from 'h3'
import type { FireuxAiRequest } from '../../../../types/ai'
import { isFireuxAiTask, useFireuxAi } from '../../../utils/fireux-ai.server'

type Body = Partial<FireuxAiRequest> & {
  format?: 'json' | 'text'
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as Body | null
  const task = body?.task

  if (!isFireuxAiTask(task)) {
    return {
      ok: false,
      reason: 'Unsupported FireUX AI task.',
      allowedTasks: [
        'translate_text',
        'summarise_text',
        'rewrite_text',
        'extract_structured_data',
      ],
    }
  }

  const request: FireuxAiRequest = {
    appId: typeof body?.appId === 'string' && body.appId.trim()
      ? body.appId.trim()
      : 'unknown',
    task,
    input: body?.input,
    outputSchema: body?.outputSchema,
    locale: body?.locale,
    context: body?.context,
  }

  const ai = useFireuxAi(event)
  return body?.format === 'text'
    ? ai.generateText(request)
    : ai.generateJson(request)
})
