export type MenuAiQuality = 'standard' | 'strong'

export type MenuAiCostFile = {
  file_name?: string
  file_type?: string
  file_kind?: string
  storage_path?: string
}

type ModelPrice = {
  input: number
  cachedInput: number
  output: number
}

type UsageCall = {
  model?: string
  usage?: Record<string, unknown>
}

const USD_PER_1M_TOKENS: Record<string, ModelPrice> = {
  'gpt-5.5': { input: 5, cachedInput: 0.5, output: 30 },
  'gpt-5.4-mini': { input: 0.75, cachedInput: 0.075, output: 4.5 },
  'gpt-5.4-nano': { input: 0.2, cachedInput: 0.02, output: 1.25 },
}

const text = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const money = (amount: number) => Math.ceil(Math.max(0, amount) * 100)
const usd = (minor: number) => `$${(minor / 100).toFixed(2)}`
const roundUpMinor = (minor: number) => {
  const step =
    numberValue(process.env.FIREUX_AI_MENU_CHARGE_ROUND_STEP_MINOR) || 5
  const minimum = numberValue(process.env.FIREUX_AI_MENU_MIN_CHARGE_MINOR) || 0
  const rounded = Math.ceil(Math.max(0, minor) / step) * step

  return Math.max(minimum, rounded)
}

const modelPrice = (model: string) => {
  const key = Object.keys(USD_PER_1M_TOKENS).find((priceModel) =>
    model === priceModel || model.startsWith(`${priceModel}-`)
  )

  return key ? USD_PER_1M_TOKENS[key] : USD_PER_1M_TOKENS['gpt-5.4-mini']
}

const isPhoto = (file: MenuAiCostFile) => {
  const kind = text(file.file_kind).toLowerCase()
  const type = text(file.file_type).toLowerCase()
  const name = text(file.file_name || file.storage_path).toLowerCase()

  return kind === 'photo' ||
    type.startsWith('image/') ||
    /\.(jpe?g|png|gif|webp)$/i.test(name)
}

const isPdf = (file: MenuAiCostFile) => {
  const kind = text(file.file_kind).toLowerCase()
  const type = text(file.file_type).toLowerCase()
  const name = text(file.file_name || file.storage_path).toLowerCase()

  return kind === 'pdf' || type === 'application/pdf' || name.endsWith('.pdf')
}

const isUrl = (file: MenuAiCostFile) =>
  text(file.file_kind).toLowerCase() === 'url' ||
    /^https?:\/\//i.test(text(file.file_name || file.storage_path))

export function menuAiModelPlan(
  files: MenuAiCostFile[],
  quality: MenuAiQuality
) {
  const hasPhoto = files.some(isPhoto)
  const hasUrl = files.some(isUrl)
  const fileProfile = hasPhoto
    ? 'photo'
    : hasUrl
      ? 'url'
      : files.every(isPdf)
        ? 'pdf'
        : 'document'
  const extractionModel = quality === 'strong'
    ? text(process.env.FIREUX_AI_MENU_EXTRACTION_STRONG_MODEL) || 'gpt-5.5'
    : hasUrl
      ? text(process.env.FIREUX_AI_MENU_URL_EXTRACTION_MODEL) || 'gpt-5.4-nano'
      : hasPhoto
      ? text(process.env.FIREUX_AI_MENU_PHOTO_EXTRACTION_MODEL) || 'gpt-5.4-mini'
      : text(process.env.FIREUX_AI_MENU_PDF_EXTRACTION_MODEL) || 'gpt-5.4-nano'
  const normalizationModel =
    text(process.env.FIREUX_AI_MENU_NORMALIZATION_MODEL) || 'gpt-5.4-nano'

  return {
    quality,
    file_profile: fileProfile,
    extraction_model: extractionModel,
    normalization_model: normalizationModel,
  }
}

function estimatedTokens(file: MenuAiCostFile) {
  if (isUrl(file)) {
    return {
      input: numberValue(process.env.FIREUX_AI_MENU_ESTIMATE_URL_INPUT_TOKENS) || 30_000,
      output: numberValue(process.env.FIREUX_AI_MENU_ESTIMATE_URL_OUTPUT_TOKENS) || 3_000,
    }
  }

  if (isPhoto(file)) {
    return {
      input: numberValue(process.env.FIREUX_AI_MENU_ESTIMATE_PHOTO_INPUT_TOKENS) || 25_000,
      output: numberValue(process.env.FIREUX_AI_MENU_ESTIMATE_PHOTO_OUTPUT_TOKENS) || 3_000,
    }
  }

  return {
    input: numberValue(process.env.FIREUX_AI_MENU_ESTIMATE_DOC_INPUT_TOKENS) || 15_000,
    output: numberValue(process.env.FIREUX_AI_MENU_ESTIMATE_DOC_OUTPUT_TOKENS) || 2_500,
  }
}

function costMinor(model: string, inputTokens: number, outputTokens: number) {
  const price = modelPrice(model)
  return money(
    (inputTokens / 1_000_000) * price.input +
      (outputTokens / 1_000_000) * price.output
  )
}

export function estimateMenuAiCost(input: {
  files: MenuAiCostFile[]
  quality: MenuAiQuality
}) {
  const files = input.files.length ? input.files : [{}]
  const plan = menuAiModelPlan(files, input.quality)
  const extractionMinor = files.reduce((total, file) => {
    const tokens = estimatedTokens(file)
    return total + costMinor(plan.extraction_model, tokens.input, tokens.output)
  }, 0)
  const normalizationInput = files.length *
    (numberValue(process.env.FIREUX_AI_MENU_ESTIMATE_NORMALIZATION_INPUT_TOKENS) || 4_000)
  const normalizationOutput = files.length *
    (numberValue(process.env.FIREUX_AI_MENU_ESTIMATE_NORMALIZATION_OUTPUT_TOKENS) || 2_000)
  const normalizationMinor = costMinor(
    plan.normalization_model,
    normalizationInput,
    normalizationOutput
  )
  const safetyMultiplier =
    numberValue(process.env.FIREUX_AI_MENU_ESTIMATE_SAFETY_MULTIPLIER) || 1.5
  const providerEstimateMinor = extractionMinor + normalizationMinor
  const amountMinor = roundUpMinor(money(
    ((extractionMinor + normalizationMinor) / 100) * safetyMultiplier
  ))

  return {
    ...plan,
    currency: 'USD',
    amount_minor: amountMinor,
    amount_label: usd(amountMinor),
    provider_estimate_minor: providerEstimateMinor,
    provider_estimate_label: usd(providerEstimateMinor),
    source_files: files.length,
    planned_ai_calls: files.length + 1,
    charge_round_step_minor:
      numberValue(process.env.FIREUX_AI_MENU_CHARGE_ROUND_STEP_MINOR) || 5,
    safety_multiplier: safetyMultiplier,
    estimate: true,
  }
}

function costFromUsage(call: UsageCall) {
  const model = text(call.model)
  const usage = record(call.usage)
  if (!model || !Object.keys(usage).length) return 0

  const inputTokens = numberValue(usage.input_tokens)
  const outputTokens = numberValue(usage.output_tokens)
  const cachedTokens = numberValue(record(usage.input_tokens_details).cached_tokens)
  const price = modelPrice(model)
  const billableInputTokens = Math.max(0, inputTokens - cachedTokens)

  return money(
    (billableInputTokens / 1_000_000) * price.input +
      (cachedTokens / 1_000_000) * price.cachedInput +
      (outputTokens / 1_000_000) * price.output
  )
}

export function actualMenuAiCost(calls: UsageCall[]) {
  const billableCalls = calls.filter((call) => Object.keys(record(call.usage)).length)
  const amountMinor = billableCalls.reduce(
    (total, call) => total + costFromUsage(call),
    0
  )

  return {
    currency: 'USD',
    amount_minor: amountMinor,
    amount_label: usd(amountMinor),
    calls_count: billableCalls.length,
    actual: billableCalls.length > 0,
  }
}
