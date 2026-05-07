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

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useTranslate() {
  const translate = async (input: TranslateInput): Promise<TranslateResult> => {
    const text = normalizeString(input.text)
    const from = normalizeString(input.from)
    const to = normalizeString(input.to)

    return {
      text,
      from,
      to,
      provider: 'manual',
    }
  }

  return { translate }
}
