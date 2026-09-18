import { createError, type H3Event } from 'h3'
import { firstString, resolveConfig } from './fireux-ai-config.server'

export type FireuxImageRequest = { prompt: string }

/** Server-only image primitive. The caller owns authority, prompts and storage. */
export async function generateFireuxImage(
  event: H3Event,
  input: FireuxImageRequest
) {
  const config = resolveConfig(event)
  if (
    !config.enabled ||
    config.mode !== 'app' ||
    config.provider !== 'openai' ||
    !config.apiKey
  ) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Image generation is not configured for this App.',
    })
  }
  const prompt = input.prompt.trim()
  if (!prompt || prompt.length > 8_000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'An image prompt of up to 8,000 characters is required.',
    })
  }
  const model =
    firstString(process.env.FIREUX_AI_IMAGE_MODEL) || 'gpt-image-2.5-flare'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 180_000)
  try {
    const response = await fetch(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'medium',
          output_format: 'webp',
          output_compression: 85,
        }),
      }
    )
    if (!response.ok) {
      // Provider bodies can contain request details. Return a bounded public error.
      throw createError({
        statusCode: response.status === 429 ? 429 : 502,
        statusMessage:
          response.status === 429
            ? 'Image generation is busy. Try again later.'
            : `Image provider rejected the request (${response.status}).`,
      })
    }
    const payload = (await response.json()) as {
      data?: { b64_json?: unknown }[]
      usage?: Record<string, unknown>
    }
    const encoded = payload.data?.[0]?.b64_json
    if (
      typeof encoded !== 'string' ||
      encoded.length > 14_000_000 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)
    ) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Image provider returned an invalid image.',
      })
    }
    const data = Buffer.from(encoded, 'base64')
    if (
      data.length < 12 ||
      data.length > 10 * 1024 * 1024 ||
      data.toString('ascii', 0, 4) !== 'RIFF' ||
      data.toString('ascii', 8, 12) !== 'WEBP'
    ) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Image provider returned an invalid WebP image.',
      })
    }
    return {
      data,
      contentType: 'image/webp',
      model,
      provider: 'openai' as const,
      usage: payload.usage,
    }
  } catch (error) {
    if (controller.signal.aborted)
      throw createError({
        statusCode: 504,
        statusMessage: 'Image generation timed out. Try again.',
      })
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({
      statusCode: 502,
      statusMessage: 'Image generation failed. Try again.',
    })
  } finally {
    clearTimeout(timeout)
  }
}
