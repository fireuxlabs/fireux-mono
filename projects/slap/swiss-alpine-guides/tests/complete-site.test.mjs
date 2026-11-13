import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
const activities = JSON.parse(readFileSync(new URL('../app/content/activities.json', import.meta.url), 'utf8'))
const origin = process.env.ALPINE_TEST_ORIGIN || 'http://127.0.0.1:3036'
const canonical = process.env.ALPINE_CANONICAL_ORIGIN || 'https://prototype-swiss-alpine-guides.web.app'
const expected = ['heliskiing','ski-guiding','avalanche-courses','freeride','snowshoe-trekking','waterfall-ice-climbing','ski-touring','glacier-ice-climbing','via-ferrata','heli-hiking','glacier-trekking','rock-climbing','mountaineering','paragliding','team-events','river-rafting','canyoning']

test('all original activity families and German-only programmes are retained', () => {
  assert.deepEqual(activities.map(item => item.slug).sort(), [...expected].sort())
  for (const [slug, name] of [['via-ferrata','Tierbergli'],['glacier-trekking','Steingletscher'],['heli-hiking','Sustenlimi'],['rock-climbing','Lead-climbing'],['mountaineering','crevasse-rescue']]) {
    assert.ok(activities.find(item => item.slug === slug).programs.some(item => item.name.includes(name)))
  }
  for (const item of activities) {
    assert.ok(item.source.startsWith('https://www.swissalpineguides.ch/'))
    assert.equal(item.legacy === true, ['canyoning','river-rafting'].includes(item.slug))
    if (item.image) assert.ok(existsSync(new URL('../public' + item.image, import.meta.url)))
  }
})

for (const slug of expected) test(`activity page is complete SSR content: ${slug}`, async () => {
  const item = activities.find(item => item.slug === slug)
  const response = await fetch(origin + item.path)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
  const html = await response.text()
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1)
  assert.ok(html.includes(`href="${canonical}${item.path}"`))
  assert.ok(html.includes('Original '), 'source attribution is visible')
  assert.ok(html.includes('/contact?tour=' + slug) || item.heliski)
  for (const program of item.programs) assert.ok(html.includes(program.name.replaceAll('&','&amp;')), program.name)
  if (item.legacy) assert.ok(html.includes('Older original-site listing'))
  if (slug === 'ski-touring') assert.ok(html.includes('archived dates'))
})

for (const path of ['/activities','/summer','/winter','/courses','/rentals','/vouchers','/about','/news','/resources','/terms','/contact']) test(`full-site navigation destination: ${path}`, async () => {
  const response = await fetch(origin + path)
  assert.equal(response.status, 200)
  const html = await response.text()
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1)
  assert.ok(html.includes(`href="${canonical}${path}"`))
})

test('activity index exposes every original activity and unknown activities return 404', async () => {
  const html = await (await fetch(origin + '/activities')).text()
  for (const item of activities) assert.ok(html.includes(`href="${item.path}"`))
  assert.equal((await fetch(origin + '/activities/not-an-activity')).status, 404)
})

test('rentals and vouchers retain practical original information', async () => {
  const rentals = await (await fetch(origin + '/rentals')).text()
  for (const word of ['Crampons','Leki','Avalanche transceiver','One day','Two days']) assert.ok(rentals.includes(word))
  const vouchers = await (await fetch(origin + '/vouchers')).text()
  for (const word of ['PDF','postal','three years','further two years','gift-vouchers']) assert.ok(vouchers.includes(word))
})
