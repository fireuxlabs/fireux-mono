export type FireuxAiProvider = 'openai' | 'google' | 'anthropic'

export type FireuxAiMode = 'disabled' | 'simulator' | 'codex' | 'app'

export type FireuxAiExecution = 'disabled' | 'simulator' | 'codex' | 'provider'

export type FireuxAiTask =
  | 'translate_text'
  | 'summarise_text'
  | 'rewrite_text'
  | 'extract_structured_data'

export interface FireuxAiConfig {
  enabled: boolean
  provider: FireuxAiProvider
  apiKey?: string
  model?: string
  mode: FireuxAiMode
}

export interface FireuxAiRequest {
  appId: string
  task: FireuxAiTask
  input: unknown
  model?: string
  timeoutMs?: number
  outputSchema?: unknown
  outputJsonSchema?: Record<string, unknown>
  locale?: string
  context?: Record<string, unknown>
}

export interface FireuxAiUsageLogEntry {
  appId: string
  task: FireuxAiTask
  provider: FireuxAiProvider
  model?: string
  mode: FireuxAiMode
  execution: FireuxAiExecution
  ok: boolean
  reason?: string
}

export interface FireuxAiResponse<T = unknown> {
  ok: boolean
  task: FireuxAiTask
  data?: T
  text?: string
  disabled?: boolean
  reason?: string
  provider?: FireuxAiProvider
  model?: string
  execution?: FireuxAiExecution
  usage?: Record<string, unknown>
}

export type FireuxAiUsageLogHook = (
  entry: FireuxAiUsageLogEntry
) => void | Promise<void>
