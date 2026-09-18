import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import {
  availableWebsiteInteractions,
  menuWebsiteOrderUrl,
  menuWebsiteSnippet,
  menuWebsiteOrigin,
} from '../../runtime/kitchen/utils/menu-website-snippet.ts'

const candidate = menuWebsiteOrderUrl({
  origin: 'https://misebox.app',
  scope: { kind: 'directory', kitchenSlug: 'baeren-ringgenberg' },
  menuId: 'food',
  context: 'collection',
  serviceId: 'breakfast',
})

test('website URL preserves explicit venue, menu and guest context', () => {
  assert.equal(
    candidate,
    'https://misebox.app/kitchens/baeren-ringgenberg/menus/food.collection?service=breakfast'
  )
  assert.equal(
    menuWebsiteOrderUrl({
      origin: 'https://restaurant.example',
      scope: { kind: 'tenant' },
      menuId: 'drinks',
      context: 'delivery',
      serviceId: 'breakfast',
    }),
    'https://restaurant.example/drinks.delivery?service=breakfast'
  )
  assert.equal(
    menuWebsiteOrderUrl({
      origin: 'https://misebox.app',
      scope: { kind: 'directory', kitchenSlug: '' },
      menuId: 'food',
      context: 'collection',
      serviceId: 'breakfast',
    }),
    ''
  )
})

test('only linked published Menus and enabled unpaused supported interactions can be shared', () => {
  const menu = { id: 'food', status: 'published' as const }
  const service = {
    id: 'breakfast',
    name: 'Breakfast',
    enabled: true,
    menu_ids: ['food'],
    hours: {
      timezone: 'Europe/Zurich',
      source: 'custom' as const,
      windows: [{ days: ['monday' as const], open: '07:00', close: '10:00' }],
    },
    interactions: [
      { type: 'browse' as const, enabled: true },
      { type: 'collection' as const, enabled: true },
      {
        type: 'delivery' as const,
        enabled: true,
        availability: { paused: true },
      },
    ],
  }
  assert.deepEqual(availableWebsiteInteractions(menu, service), [
    'browse',
    'collection',
  ])
  assert.deepEqual(
    availableWebsiteInteractions({ ...menu, status: 'draft' }, service),
    []
  )
  assert.deepEqual(
    availableWebsiteInteractions(menu, { ...service, enabled: false }),
    []
  )
  assert.deepEqual(
    availableWebsiteInteractions(menu, { ...service, menu_ids: [] }),
    []
  )
  assert.deepEqual(
    availableWebsiteInteractions(menu, { ...service, hours: undefined }),
    ['browse']
  )
  assert.deepEqual(
    availableWebsiteInteractions(
      { ...menu, doc: { url: 'https://example.test/menu.pdf' } },
      service
    ),
    ['browse']
  )
})

test('unsafe origins and attribute injection cannot become executable snippet input', () => {
  for (const origin of [
    'javascript:alert(1)',
    'data:text/html,hello',
    'http://restaurant.example',
    'https://user:secret@example.com',
  ]) {
    assert.equal(
      menuWebsiteOrderUrl({
        origin,
        scope: { kind: 'tenant' },
        menuId: 'food',
        context: 'collection',
        serviceId: 'breakfast',
      }),
      ''
    )
    assert.equal(menuWebsiteSnippet(origin), '')
  }
  const snippet = menuWebsiteSnippet(
    'https://example.com/food.collection?x="&y=<script>'
  )
  assert.ok(snippet.includes('&amp;'))
  assert.equal((snippet.match(/<script>/g) || []).length, 1)
})

test('dialog reopening preserves iframe and first click never posts an order', () => {
  const script = menuWebsiteSnippet(candidate).match(
    /<script>\n([\s\S]*?)\n<\/script>/
  )?.[1]
  assert.ok(script)
  let click: (event: { preventDefault: () => void }) => void
  let openings = 0
  let assignments = 0
  let prevented = 0
  let source = ''
  const frame = {
    hasAttribute: () => Boolean(source),
    getAttribute: () => candidate,
    set src(value: string) {
      source = value
      assignments++
    },
  }
  const dialog = {
    showModal: () => {
      openings++
    },
  }
  const link = {
    addEventListener: (_name: string, listener: typeof click) => {
      click = listener
    },
  }
  const elements = { a: link, dialog, iframe: frame }
  const root = {
    querySelector: (name: keyof typeof elements) => elements[name],
  }
  vm.runInNewContext(script, {
    document: { currentScript: { previousElementSibling: root } },
  })
  click!({
    preventDefault: () => {
      prevented++
    },
  })
  click!({
    preventDefault: () => {
      prevented++
    },
  })
  assert.equal(openings, 2)
  assert.equal(assignments, 1)
  assert.equal(prevented, 2)
  assert.equal(source, candidate)
})

test('harness contains the generated canonical checkout consumer', () => {
  const html = readFileSync(
    new URL(
      '../../../../../../projects/fireux/no-fireux-embed-test/public/misebox.html',
      import.meta.url
    ),
    'utf8'
  )
  assert.ok(
    html.includes(
      menuWebsiteSnippet(
        candidate
          .split('?')[0]!
          .replace('https://misebox.app', 'https://misebox-78f9c.web.app')
      )
    )
  )
})

test('local checkout harness uses guarded local provider activation', () => {
  const html = readFileSync(
    new URL(
      '../../../../../../projects/fireux/no-fireux-embed-test/public/misebox.html',
      import.meta.url
    ),
    'utf8'
  )
  assert.match(
    html,
    /connectLocalProviderIframe\(\{\s*selector: '#baeren-local-checkout'/
  )
  assert.match(
    html,
    /path: '\/kitchens\/baeren-ringgenberg\/menus\/food.collection'/
  )
  const frame = html.match(/<iframe id="baeren-local-checkout"[^>]*>/)?.[0]
  assert.ok(frame)
  assert.ok(frame.includes('hidden'))
  assert.doesNotMatch(frame, /(?:data-)?src=/)
})

test('website buttons use the customer origin while local previews stay local', () => {
  assert.equal(
    menuWebsiteOrigin('https://workspace.misebox.app', 'https://misebox.app'),
    'https://misebox.app'
  )
  assert.equal(
    menuWebsiteOrigin('http://workspace.localhost:3001', 'https://misebox.app'),
    'http://localhost:3001'
  )
  assert.equal(
    menuWebsiteOrigin('http://localhost:3001', 'https://misebox.app'),
    'http://localhost:3001'
  )
  assert.equal(
    menuWebsiteOrigin(
      'https://restaurant.example',
      'https://restaurant.example'
    ),
    'https://restaurant.example'
  )
  assert.equal(menuWebsiteOrigin('invalid'), '')
  assert.equal(
    menuWebsiteOrderUrl({
      origin: menuWebsiteOrigin('http://workspace.localhost:3001'),
      scope: { kind: 'directory', kitchenSlug: 'la-tapberne' },
      menuId: 'comida-casera-2',
      context: 'pre_order',
      serviceId: 'dinner',
    }),
    'http://localhost:3001/kitchens/la-tapberne/menus/comida-casera-2.pre_order?service=dinner'
  )
})
