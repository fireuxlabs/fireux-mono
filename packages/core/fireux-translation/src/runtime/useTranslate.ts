export type TranslateInput = {
  text: string
  from: string
  to: string
}

export type TranslateResult = {
  text: string
  from: string
  to: string
  provider: string
}

export type UseTranslateOptions = {
  endpoint?: string
}

const DEFAULT_TRANSLATE_ENDPOINT = '/api/translate'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useTranslate(options: UseTranslateOptions = {}) {
  const endpoint = normalizeString(options.endpoint) || DEFAULT_TRANSLATE_ENDPOINT

  const translate = async (input: TranslateInput): Promise<TranslateResult> => {
    const text = normalizeString(input.text)
    const from = normalizeString(input.from)
    const to = normalizeString(input.to)

    if (!text) throw new Error('Text is required')
    if (!from) throw new Error('Source language is required')
    if (!to) throw new Error('Target language is required')

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, from, to }),
    })
    const data = (await response.json().catch(() => null)) as (Partial<TranslateResult> & {
      message?: string
      statusMessage?: string
    }) | null

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.statusMessage ||
        `Translation failed with status ${response.status}`
      )
    }

    return {
      text: normalizeString(data?.text),
      from: normalizeString(data?.from) || from,
      to: normalizeString(data?.to) || to,
      provider: normalizeString(data?.provider) || 'unknown',
    }
  }

  return { translate }
}
