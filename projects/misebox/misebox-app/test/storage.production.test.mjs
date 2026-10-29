import assert from 'node:assert/strict'
import test from 'node:test'

const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST || ''
assert.match(
  host,
  /^(localhost|127\.0\.0\.1):\d+$/,
  'Storage policy tests require a local emulator; no cloud fallback.'
)
const bucket = 'demo-misebox-production-rules.appspot.com'
const base = `http://${host}/v0/b/${bucket}/o`
const image = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
  'base64'
)
const objectPath = 'places/fixture/image/revisions/policy-test'
const objectUrl = `${base}/${encodeURIComponent(objectPath)}`
const token =
  Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString(
    'base64url'
  ) +
  '.' +
  Buffer.from(
    JSON.stringify({
      sub: 'operator',
      user_id: 'operator',
      aud: 'demo-misebox-production-rules',
      iss: 'https://securetoken.google.com/demo-misebox-production-rules',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      firebase: { sign_in_provider: 'password' },
    })
  ).toString('base64url') +
  '.'

test('candidate denies browser object creation for every supported media family', async () => {
  for (const family of [
    'places',
    'ingredients',
    'kitchens',
    'blogs',
    'products',
    'professionals',
    'unknown',
  ]) {
    for (const authorization of [undefined, `Bearer ${token}`]) {
      const response = await fetch(
        `${base}?uploadType=media&name=${encodeURIComponent(`${family}/fixture/image`)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'image/png',
            ...(authorization ? { Authorization: authorization } : {}),
          },
          body: image,
        }
      )
      assert.equal(response.status, 403, `${family}: ${await response.text()}`)
    }
  }
})
test('candidate denies SDK reads, listing, overwrite and delete while explicit image tokens remain usable', async () => {
  // Emulator-only Admin bypass seeds the same kind of tokenized public image as the server helper.
  const upload = await fetch(
    `${base}?uploadType=media&name=${encodeURIComponent(objectPath)}`,
    {
      method: 'POST',
      headers: { Authorization: 'Bearer owner', 'Content-Type': 'image/png' },
      body: image,
    }
  )
  assert.equal(upload.status, 200, await upload.text())
  const metadata = await fetch(objectUrl, {
    headers: { Authorization: 'Bearer owner' },
  }).then((response) => response.json())
  const downloadToken = metadata.downloadTokens?.split(',')[0]
  assert.ok(
    downloadToken,
    'Admin-created emulator image has an explicit download token'
  )
  for (const authorization of [undefined, `Bearer ${token}`]) {
    const headers = authorization ? { Authorization: authorization } : {}
    for (const [url, method] of [
      [objectUrl, 'GET'],
      [base, 'GET'],
      [objectUrl, 'DELETE'],
    ]) {
      const response = await fetch(url, { method, headers })
      assert.equal(response.status, 403, `${method}: ${await response.text()}`)
    }
    const overwrite = await fetch(
      `${base}?uploadType=media&name=${encodeURIComponent(objectPath)}`,
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'image/png' },
        body: image,
      }
    )
    assert.equal(overwrite.status, 403)
  }
  const publicImage = await fetch(
    `${objectUrl}?alt=media&token=${encodeURIComponent(downloadToken)}`
  )
  assert.equal(publicImage.status, 200)
  assert.deepEqual(Buffer.from(await publicImage.arrayBuffer()), image)
})
