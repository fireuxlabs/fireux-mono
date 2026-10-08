import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL('../runtime/server/utils/getAdmin.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
const parse = compileFunction(
  `${stripTypeScriptTypes(source)}; return parseServiceAccountJson`
)()
const account = {
  project_id: 'fixture-project',
  client_email: 'fixture@example.test',
  private_key: 'fixture\\nkey',
}
test('Core accepts JSON and the existing App inline base64 credential contract without changing file input', () => {
  const json = JSON.stringify(account)
  const expected = {
    projectId: account.project_id,
    clientEmail: account.client_email,
    privateKey: 'fixture\nkey',
  }
  assert.deepEqual(parse(json, 'FIREBASE_SERVICE_ACCOUNT'), expected)
  assert.deepEqual(
    parse(Buffer.from(json).toString('base64'), 'FIREBASE_SERVICE_ACCOUNT'),
    expected
  )
  assert.deepEqual(parse(json, 'FIREBASE_SERVICE_ACCOUNT_FILE'), expected)
  assert.throws(
    () =>
      parse(
        Buffer.from(json).toString('base64'),
        'FIREBASE_SERVICE_ACCOUNT_FILE'
      ),
    /valid JSON/
  )
})
test('Invalid credential configuration fails without exposing its contents', () => {
  const privateValue = 'fixture-sensitive-input'
  for (const value of [
    privateValue,
    JSON.stringify({ project_id: 'incomplete' }),
    Buffer.from('{}').toString('base64'),
  ]) {
    assert.throws(
      () => parse(value, 'FIREBASE_SERVICE_ACCOUNT'),
      (error) =>
        !error.message.includes(privateValue) &&
        /JSON|missing/.test(error.message)
    )
  }
})
