import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, names, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function command({
  authorized = true,
  exists = true,
  recipient = '+41790000000',
  enabled = true,
  providerError,
} = {}) {
  const calls = []
  const { testKitchenOrderingWhatsApp } = load(
    '../runtime/kitchen/server/ordering/whatsapp-test.ts',
    'testKitchenOrderingWhatsApp',
    {
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
      requirePathSegment: (value) => {
        if (typeof value !== 'string' || !value || value.includes('/'))
          throw new Error('Invalid id')
        return value
      },
      requireKitchenOperator: async (event, input) => {
        calls.push(['authorize', input])
        if (!authorized)
          throw Object.assign(new Error('Denied'), { statusCode: 403 })
      },
      getRuntimeFirestore: () => ({
        doc: (path) => ({
          get: async () => {
            calls.push(['read', path])
            return {
              exists,
              data: () => ({
                services: [
                  {
                    id: 'breakfast',
                    interactions: [
                      {
                        type: 'pre_order',
                        enabled: false,
                        notifications: {
                          whatsapp: { enabled, recipient_phone: recipient },
                        },
                      },
                    ],
                  },
                ],
              }),
            }
          },
        }),
      }),
      readKitchenServices: (value) => value,
      sendPreOrderWhatsAppTest: async (phone) => {
        calls.push(['send', phone])
        if (providerError) throw providerError
        return 'provider-id'
      },
      preOrderWhatsAppErrorMessage: () => 'Provider unavailable.',
    }
  )
  return {
    run: (input) =>
      testKitchenOrderingWhatsApp(
        {},
        input || { appId: 'app', kitchenId: 'kitchen', serviceId: 'breakfast' }
      ),
    calls,
  }
}

test('operator rejection happens before reading recipient or contacting provider', async () => {
  const { run, calls } = command({ authorized: false })
  await assert.rejects(run(), { statusCode: 403 })
  assert.deepEqual(
    calls.map((call) => call[0]),
    ['authorize']
  )
})

test('missing Kitchen and disabled or missing recipient cannot send a test', async () => {
  for (const [options, statusCode] of [
    [{ exists: false }, 404],
    [{ enabled: false }, 409],
    [{ recipient: '' }, 409],
  ]) {
    const { run, calls } = command(options)
    await assert.rejects(run(), { statusCode })
    assert.equal(
      calls.some((call) => call[0] === 'send'),
      false
    )
  }
})

test('test uses only the stored recipient and does not enable ordering', async () => {
  const { run, calls } = command()
  assert.deepEqual(
    await run({
      appId: 'app',
      kitchenId: 'kitchen',
      serviceId: 'breakfast',
      recipient_phone: '+44999999999',
    }),
    { ok: true, provider_message_id: 'provider-id' }
  )
  assert.deepEqual(calls, [
    ['authorize', { appId: 'app', kitchenId: 'kitchen' }],
    ['read', 'kitchens/kitchen'],
    ['send', '+41790000000'],
  ])
})

test('provider failure is mapped through the existing error sanitizer', async () => {
  const { run } = command({ providerError: new Error('provider detail') })
  await assert.rejects(run(), {
    statusCode: 502,
    statusMessage: 'Provider unavailable.',
  })
})

test('notification delivery skips invalid IDs without claiming or contacting a provider', async () => {
  const { dispatchPreOrderWhatsApp } = load(
    '../runtime/kitchen/server/ordering/whatsapp.ts',
    'dispatchPreOrderWhatsApp'
  )
  assert.deepEqual(
    await dispatchPreOrderWhatsApp({
      appId: 'app',
      kitchenId: 'kitchen',
      orderId: '../order',
    }),
    { state: 'skipped' }
  )
})
