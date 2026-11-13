import assert from 'node:assert/strict'
import test from 'node:test'

const origin = process.env.ALPINE_TEST_ORIGIN || 'http://127.0.0.1:3036'
const canonicalOrigin = process.env.ALPINE_CANONICAL_ORIGIN || 'https://prototype-swiss-alpine-guides.web.app'
const paths = ['/', '/heliskiing/ebnefluh-petersgrat', '/heliskiing/ebnefluh', '/heliskiing/petersgrat', '/heliskiing/sustenlimi']
const metadata = (html, name) => html.match(new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]+content="([^"]+)"`))?.[1]

for (const path of paths) {
  test(`SSR identity, canonical and truthful graph: ${path}`, async () => {
    const response = await fetch(origin + path)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
    const html = await response.text()
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1)
    assert.match(html, new RegExp(`<link[^>]+rel="canonical"[^>]+href="${canonicalOrigin}${path}"`))
    assert.match(metadata(html, 'robots'), /noindex/)
    assert.equal(metadata(html, 'og:url'), canonicalOrigin + path)
    assert.match(metadata(html, 'description'), /Swiss Alpine Guides/)
    assert.match(metadata(html, 'og:image'), /^https:\/\//)
    const script = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)
    assert.ok(script, 'JSON-LD is present before client JavaScript')
    const graph = JSON.parse(script[1])['@graph']
    const business = graph.find(item => item['@type'] === 'LocalBusiness')
    assert.equal(business.name, 'Swiss Alpine Guides')
    assert.equal(business.address.streetAddress, 'Eyacheri 2')
    assert.match(html, /Eyacheri 2/)
    const webpage = graph.find(item => item['@type'] === 'WebPage')
    assert.equal(webpage.url, canonicalOrigin + path)
    assert.equal(webpage.isPartOf['@id'], canonicalOrigin + '/#website')
    assert.ok(!JSON.stringify(graph).includes('aggregateRating'))
    assert.ok(!graph.some(item => item['@type'] === 'Offer'))
    if (path !== '/') {
      assert.ok(graph.some(item => item['@type'] === 'BreadcrumbList'))
      assert.equal(graph.find(item => item['@type'] === 'Service').provider['@id'], business['@id'])
      assert.match(html, /Confirm with operator/)
      assert.match(html, /#enquire/)
    } else {
      const list = graph.find(item => item['@type'] === 'ItemList')
      assert.equal(list.itemListElement.length, 6)
      for (const route of ['/activities/via-ferrata', '/activities/glacier-trekking', '/activities/mountaineering', '/activities/heliskiing', '/activities/snowshoe-trekking', '/activities/avalanche-courses']) assert.ok(html.includes(`href="${route}"`))
      assert.match(html, /preload="metadata"/)
    }
  })
}

test('Petersgrat renders both distinct descents and enquiry identities', async () => {
  const html = await (await fetch(origin + '/heliskiing/petersgrat')).text()
  for (const value of ['petersgrat-blatten', 'petersgrat-stechelberg', '10 km', '15 km', '1,700 m', '2,300 m']) assert.ok(html.includes(value), value)
})

test('unknown tour paths are genuine 404s', async () => {
  assert.equal((await fetch(origin + '/heliskiing/not-a-tour')).status, 404)
})

test('query parameters do not create another canonical identity', async () => {
  const html = await (await fetch(origin + '/heliskiing/ebnefluh?utm_source=seo-test')).text()
  assert.equal(metadata(html, 'og:url'), canonicalOrigin + '/heliskiing/ebnefluh')
})

test('preview excludes the new public routes and operator tools from sitemap discovery', async () => {
  const xml = await (await fetch(origin + '/sitemaps/static.xml')).text()
  for (const path of [...paths.slice(1), '/operator']) assert.ok(!xml.includes(`<loc>${canonicalOrigin}${path}</loc>`))
  const robots = await (await fetch(origin + '/robots.txt')).text()
  assert.match(robots, /Disallow: \/(?:\r?\n|$)/)
})

test('tour titles and descriptions distinguish the four search intents', async () => {
  const titles = [], descriptions = []
  for (const path of paths.slice(1)) {
    const html = await (await fetch(origin + path)).text()
    titles.push(html.match(/<title>(.*?)<\/title>/)?.[1])
    descriptions.push(metadata(html, 'description'))
  }
  assert.equal(new Set(titles).size, 4)
  assert.equal(new Set(descriptions).size, 4)
})
