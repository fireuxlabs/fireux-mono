import { createError, type H3Event } from 'h3'
import { firstString, resolveConfig } from './fireux-ai-config.server'

export type FireuxAudioInput = {
  data: Buffer
  fileName: string
  contentType: string
}

export async function transcribeFireuxAudio(
  event: H3Event,
  audio: FireuxAudioInput
) {
  const config = resolveConfig(event)
  if (!config.enabled || config.mode !== 'app') {
    throw createError({
      statusCode: 503,
      statusMessage: 'Voice transcription is not enabled for this App.',
    })
  }
  if (config.provider !== 'openai' || !config.apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Voice transcription is not configured.',
    })
  }

  const model =
    firstString(process.env.FIREUX_AI_TRANSCRIBE_MODEL) ||
    'gpt-4o-mini-transcribe'
  const body = new FormData()
  body.append('model', model)
  body.append(
    'file',
    new Blob([new Uint8Array(audio.data)], { type: audio.contentType }),
    audio.fileName
  )
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)

  try {
    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.apiKey}` },
        body,
        signal: controller.signal,
      }
    )
    const payload = (await response.json().catch(() => null)) as {
      text?: unknown
      error?: { message?: unknown }
    } | null
    if (!response.ok) {
      throw createError({
        statusCode: 502,
        statusMessage:
          firstString(payload?.error?.message) || 'Voice transcription failed.',
      })
    }
    const text = firstString(payload?.text)
    if (!text) {
      throw createError({
        statusCode: 422,
        statusMessage: 'No speech could be transcribed.',
      })
    }
    return { text, model, provider: config.provider }
  } catch (cause) {
    if (controller.signal.aborted) {
      throw createError({
        statusCode: 504,
        statusMessage: 'Voice transcription timed out.',
      })
    }
    throw cause
  } finally {
    clearTimeout(timeout)
  }
}
