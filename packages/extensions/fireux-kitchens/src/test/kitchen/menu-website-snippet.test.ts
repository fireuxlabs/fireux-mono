import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import {
  availableWebsiteOrderContexts,
  menuWebsiteOrderUrl,
  menuWebsiteSnippet,
  menuWebsiteOrigin,
} from '../../runtime/kitchen/utils/menu-website-snippet.ts'

const candidate = menuWebsiteOrderUrl({
  origin: 'https://misebox.app',
  scope: { kind: 'directory', kitchenSlug: 'baeren-ringgenberg' },
  menuId: 'food',
  context: 'collection',
})

test('website URL preserves explicit venue, menu and guest context', () => {
  assert.equal(
    candidate,
    'https://misebox.app/kitchens/baeren-ringgenberg/menus/food.collection'
  )
  assert.equal(
    menuWebsiteOrderUrl({
      origin: 'https://restaurant.example',
      scope: { kind: 'tenant' },
      menuId: 'drinks',
      context: 'delivery',
    }),
    'https://restaurant.example/drinks.delivery'
  )
  assert.equal(
    menuWebsiteOrderUrl({
      origin: 'https://misebox.app',
      scope: { kind: 'directory', kitchenSlug: '' },
      menuId: 'food',
      context: 'collection',
    }),
    ''
  )
})

test('only published enabled unpaused guest contexts are offered', () => {
  const ordering = {
    enabled: true,
    order_types: [
      { type: 'collection' as const },
      { type: 'delivery' as const, availability: { paused: true } },
      { type: 'eat_in' as const },
    ],
  }
  assert.deepEqual(availableWebsiteOrderContexts('published', ordering), [
    'collection',
  ])
  assert.deepEqual(availableWebsiteOrderContexts('draft', ordering), [])
  assert.deepEqual(
    availableWebsiteOrderContexts('published', { ...ordering, enabled: false }),
    []
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
        candidate.replace(
          'https://misebox.app',
          'https://misebox-78f9c.web.app'
        )
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
    }),
    'http://localhost:3001/kitchens/la-tapberne/menus/comida-casera-2.pre_order'
  )
})
