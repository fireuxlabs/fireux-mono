import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { EventEmitter } from 'node:events'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { join } from 'node:path'

const source = stripTypeScriptTypes(
  readFileSync(
    new URL(
      '../runtime/server/utils/fireux-ai-codex.server.ts',
      import.meta.url
    ),
    'utf8'
  )
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')

function fixture(env) {
  const spawns = []
  const removed = []
  const dependencies = {
    process: { env, platform: 'linux' },
    existsSync: () => false,
    mkdtemp: async () => '/tmp/fireux-codex-environment-test',
    rm: async (directory) => removed.push(directory),
    tmpdir: () => '/tmp',
    join,
    requestTimeoutMs: () => 1000,
    buildTextPrompt: () => 'Rewrite the supplied sentence.',
    setTimeout,
    clearTimeout,
    spawn: (binary, args, options) => {
      spawns.push({ binary, args, options })
      const child = new EventEmitter()
      child.stdout = new EventEmitter()
      child.stderr = new EventEmitter()
      child.stdin = {
        end() {
          queueMicrotask(() => {
            child.stdout.emit('data', 'Rewritten sentence.')
            child.emit('close', 0)
          })
        },
      }
      child.kill = () =>
        assert.fail('The fake child must finish before timeout')
      return child
    },
  }
  return {
    call: compileFunction(
      `${source}; return callCodexText`,
      Object.keys(dependencies)
    )(...Object.values(dependencies)),
    spawns,
    removed,
  }
}

test('Codex child receives neither AI credential while parent environment and other settings remain intact', async () => {
  const env = {
    NODE_ENV: 'development',
    OPENAI_API_KEY: 'legacy-test-credential',
    FIREUX_AI_API_KEY: 'canonical-test-credential',
    FIREUX_CODEX_BIN: '/local/codex',
    PATH: '/local/bin',
    APP_DOMAIN: 'localhost',
  }
  const before = { ...env }
  const f = fixture(env)
  const result = await f.call(
    { task: 'rewrite_text', input: 'A sentence.' },
    { provider: 'openai' }
  )
  assert.equal(result.ok, true)
  assert.equal(result.text, 'Rewritten sentence.')
  assert.equal(f.spawns.length, 1)
  assert.equal(f.spawns[0].binary, '/local/codex')
  const { OPENAI_API_KEY, FIREUX_AI_API_KEY, ...expected } = before
  assert.deepEqual(f.spawns[0].options.env, expected)
  assert.deepEqual(env, before)
  assert.deepEqual(f.removed, ['/tmp/fireux-codex-environment-test'])
})

test('Codex transport stays disabled outside local development', async () => {
  const f = fixture({
    NODE_ENV: 'production',
    FIREUX_AI_API_KEY: 'test-credential',
  })
  const result = await f.call({ task: 'rewrite_text' }, { provider: 'openai' })
  assert.equal(result.disabled, true)
  assert.equal(f.spawns.length, 0)
  assert.equal(f.removed.length, 0)
})
