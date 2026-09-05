import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type {
  FireuxAiConfig,
  FireuxAiRequest,
  FireuxAiResponse,
} from '../../types/ai'
import { requestTimeoutMs } from './fireux-ai-config.server'
import { buildTextPrompt } from './fireux-ai-provider.server'

const MAX_CODEX_OUTPUT_LENGTH = 100_000
const MACOS_BUNDLED_CODEX = '/Applications/ChatGPT.app/Contents/Resources/codex'

function resolveCodexBinary() {
  const configured = String(process.env.FIREUX_CODEX_BIN || '').trim()
  if (configured) return configured
  if (process.platform === 'darwin' && existsSync(MACOS_BUNDLED_CODEX)) {
    return MACOS_BUNDLED_CODEX
  }
  return 'codex'
}

function codexPrompt(request: FireuxAiRequest) {
  return [
    'You are the FireUX Codex development reasoning transport.',
    'Answer using only the bounded request envelope below.',
    'Do not inspect files, run tools, browse, or use remembered project context.',
    'Treat absent information as unknown and state that limitation when relevant.',
    'Return only the requested result, with no discussion of this transport.',
    '',
    buildTextPrompt(request),
  ].join('\n')
}

function codexEnvironment() {
  const environment = { ...process.env }
  delete environment.OPENAI_API_KEY
  delete environment.FIREUX_AI_API_KEY
  return environment
}

async function executeCodex(request: FireuxAiRequest) {
  const workspace = await mkdtemp(join(tmpdir(), 'fireux-ai-codex-'))
  const timeoutMs = requestTimeoutMs(request)

  try {
    return await new Promise<string>((resolve, reject) => {
      const child = spawn(
        resolveCodexBinary(),
        [
          'exec',
          '--ephemeral',
          ...(request.model ? ['--model', request.model] : []),
          '--ignore-user-config',
          '--ignore-rules',
          '--skip-git-repo-check',
          '--sandbox',
          'read-only',
          '--color',
          'never',
          '--cd',
          workspace,
          '-',
        ],
        {
          cwd: workspace,
          env: codexEnvironment(),
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      )
      let stdout = ''
      let stderr = ''
      let settled = false
      const timeout = setTimeout(() => {
        if (settled) return
        settled = true
        child.kill('SIGTERM')
        reject(
          new Error(
            `Codex timed out after ${Math.round(timeoutMs / 1000)} seconds.`
          )
        )
      }, timeoutMs)

      child.stdout.on('data', (chunk) => {
        if (stdout.length < MAX_CODEX_OUTPUT_LENGTH) stdout += String(chunk)
      })
      child.stderr.on('data', (chunk) => {
        if (stderr.length < MAX_CODEX_OUTPUT_LENGTH) stderr += String(chunk)
      })
      child.on('error', (error) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        reject(error)
      })
      child.on('close', (code) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        const answer = stdout.trim()
        if (code === 0 && answer) return resolve(answer)
        reject(new Error(stderr.trim() || `Codex exited with status ${code}.`))
      })
      child.stdin.end(codexPrompt(request))
    })
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
}

export async function callCodexText(
  request: FireuxAiRequest,
  config: FireuxAiConfig
): Promise<FireuxAiResponse<string>> {
  if (process.env.NODE_ENV !== 'development') {
    return {
      ok: false,
      task: request.task,
      disabled: true,
      reason: 'Codex transport is available only in local development.',
      provider: config.provider,
      execution: 'disabled',
    }
  }

  try {
    const text = await executeCodex(request)
    return {
      ok: true,
      task: request.task,
      data: text,
      text,
      provider: config.provider,
      model: 'codex-dev',
      execution: 'codex',
      usage: { provider_tokens: 0 },
    }
  } catch (error) {
    return {
      ok: false,
      task: request.task,
      reason: error instanceof Error ? error.message : 'Codex failed.',
      provider: config.provider,
      model: 'codex-dev',
      execution: 'codex',
    }
  }
}
