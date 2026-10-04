import assert from 'node:assert/strict'
import test from 'node:test'
const host = process.env.FIRESTORE_EMULATOR_HOST
const project = 'demo-fireux-connections'
const root = host
  ? `http://${host}/v1/projects/${project}/databases/identity-connections`
  : ''
const field = {
  fields: {
    hubUid: { stringValue: 'victim' },
    localUid: { stringValue: 'victim-local' },
  },
}
function token(uid, claims = {}) {
  const enc = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${enc({ alg: 'none', typ: 'JWT' })}.${enc({ iss: `https://securetoken.google.com/${project}`, aud: project, sub: uid, user_id: uid, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, auth_time: Math.floor(Date.now() / 1000), firebase: { sign_in_provider: 'custom' }, ...claims })}.`
}
async function request(path, method = 'GET', auth = '', body) {
  return fetch(root + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(auth ? { authorization: `Bearer ${auth}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}
test(
  'private connection database denies all browser authority, including forged admin claims and nested paths',
  { skip: !host },
  async () => {
    const path = '/documents/accounts/victim/connections/misebox'
    const seed = await request(path, 'PATCH', 'owner', field)
    assert.equal(seed.status, 200, await seed.text())
    for (const auth of [
      '',
      token('victim'),
      token('attacker'),
      token('attacker', { admin: true, role: 'developer' }),
    ]) {
      for (const [route, method, body] of [
        [path, 'GET'],
        ['/documents/accounts', 'GET'],
        [path, 'PATCH', field],
        [path, 'DELETE'],
        ['/documents/accounts/attacker/connections/misebox', 'PATCH', field],
        ['/documents/link_requests/guess', 'GET'],
        ['/documents/login_codes/guess', 'GET'],
        ['/documents/local_accounts/guess', 'GET'],
        ['/documents/orphan/parent/nested/record', 'GET'],
        [
          '/documents:commit',
          'POST',
          {
            writes: [
              {
                update: {
                  name: `projects/${project}/databases/identity-connections/documents/accounts/victim/connections/misebox`,
                  ...field,
                },
              },
            ],
          },
        ],
        [
          '/documents:batchGet',
          'POST',
          {
            documents: [
              `projects/${project}/databases/identity-connections/documents/accounts/victim/connections/misebox`,
            ],
          },
        ],
      ]) {
        const result = await request(route, method, auth, body)
        assert.equal(
          result.status,
          403,
          `${method} ${route}: ${await result.text()}`
        )
      }
    }
  }
)
