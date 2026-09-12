import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { isIP } from 'node:net'
import { compileFunction } from 'node:vm'

const source = stripTypeScriptTypes(
  readFileSync(
    new URL(
      '../runtime/server/utils/http/public-raster-network-policy.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import .*\n/gm, '')
    .replace(/^export /gm, '')
)

function policy(records = []) {
  return compileFunction(
    `${source}; return { assertAllowedImageUrl, resolvePublicAddresses }`,
    ['isIP', 'lookup', 'createError']
  )(
    isIP,
    async () => records,
    (options) => Object.assign(new Error(options.statusMessage), options)
  )
}

const futureDeadline = () => Date.now() + 1000

test('IPv4 parsing preserves the existing rejected ranges and their boundaries', () => {
  const { assertAllowedImageUrl } = policy()
  const rejected = [
    '0.0.0.0',
    '10.1.2.3',
    '127.0.0.1',
    '224.0.0.1',
    '255.255.255.255',
    '100.64.0.0',
    '100.127.255.255',
    '169.254.1.1',
    '172.16.0.0',
    '172.31.255.255',
    '192.0.0.1',
    '192.0.2.1',
    '192.31.196.1',
    '192.52.193.1',
    '192.88.99.1',
    '192.168.1.1',
    '192.175.48.1',
    '198.18.0.1',
    '198.19.255.255',
    '198.51.100.1',
    '203.0.113.1',
  ]
  for (const address of rejected) {
    assert.throws(
      () => assertAllowedImageUrl(`https://${address}/image.png`),
      { statusCode: 400 },
      address
    )
  }
  const allowed = [
    '8.8.8.8',
    '1.1.1.1',
    '100.63.255.255',
    '100.128.0.0',
    '172.15.255.255',
    '172.32.0.0',
    '198.17.255.255',
    '198.20.0.0',
  ]
  for (const address of allowed) {
    assert.equal(
      assertAllowedImageUrl(`https://${address}/image.png`).hostname,
      address
    )
  }
})

test('compressed, expanded and embedded IPv6 addresses retain the same policy', async () => {
  const rejected = [
    '::',
    '::1',
    '::ffff:8.8.8.8',
    '::ffff:0808:0808',
    'fc00::1',
    'fdff::1',
    'fe80::1',
    'febf::1',
    'ff02::1',
    '2001:db8::1',
    '2001:10::1',
    '2002::1',
    '100::1',
    '4000::1',
  ]
  const host = new URL('https://images.example.test/image.png')
  for (const address of rejected) {
    assert.equal(isIP(address), 6)
    const { resolvePublicAddresses } = policy([{ address, family: 6 }])
    await assert.rejects(
      resolvePublicAddresses(host, futureDeadline()),
      { statusCode: 400 },
      address
    )
  }
  for (const address of [
    '2001:4860:4860::8888',
    '2001:4860:4860:0:0:0:0:8888',
    '2606:4700:4700::1111',
    '2001:4860::8.8.8.8',
  ]) {
    assert.equal(isIP(address), 6)
    const record = { address, family: 6 }
    const { resolvePublicAddresses } = policy([record])
    assert.deepEqual(await resolvePublicAddresses(host, futureDeadline()), [
      record,
    ])
  }
})

test('malformed address records are rejected before becoming a pinned target', async () => {
  const host = new URL('https://images.example.test/image.png')
  for (const address of [
    '',
    '8.8',
    '8.8.8.8.9',
    '999.8.8.8',
    '8.08.8.8',
    'bad',
  ]) {
    const { resolvePublicAddresses } = policy([{ address, family: 4 }])
    await assert.rejects(
      resolvePublicAddresses(host, futureDeadline()),
      { statusCode: 400 },
      address
    )
  }
  for (const address of [
    '2606:4700:::1111',
    '2606:4700::999.8.8.8',
    '2606:zzzz::1',
  ]) {
    const { resolvePublicAddresses } = policy([{ address, family: 6 }])
    await assert.rejects(
      resolvePublicAddresses(host, futureDeadline()),
      { statusCode: 400 },
      address
    )
  }
})

test('DNS answers remain bounded and reject any private record before selection', async () => {
  const host = new URL('https://images.example.test/image.png')
  const records = [
    { address: '8.8.8.8', family: 4 },
    { address: '2606:4700:4700::1111', family: 6 },
    { address: '1.1.1.1', family: 4 },
  ]
  assert.deepEqual(
    await policy(records).resolvePublicAddresses(host, futureDeadline()),
    records.slice(0, 2)
  )
  await assert.rejects(
    policy([
      ...records,
      { address: '127.0.0.1', family: 4 },
    ]).resolvePublicAddresses(host, futureDeadline()),
    { statusCode: 400 }
  )
})

test('literal addresses still require a live deadline and URL restrictions remain enforced', async () => {
  const { assertAllowedImageUrl, resolvePublicAddresses } = policy()
  for (const url of [
    'file:///image.png',
    'https://user:secret@example.test/image.png',
    'https://localhost/image.png',
    'https://service.internal/image.png',
  ]) {
    assert.throws(() => assertAllowedImageUrl(url), { statusCode: 400 })
  }
  const literal = assertAllowedImageUrl('https://8.8.8.8/image.png')
  assert.deepEqual(await resolvePublicAddresses(literal, futureDeadline()), [
    { address: '8.8.8.8', family: 4 },
  ])
  await assert.rejects(resolvePublicAddresses(literal, Date.now() - 1), {
    statusCode: 504,
  })
})
