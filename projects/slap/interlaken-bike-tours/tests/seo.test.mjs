import assert from 'node:assert/strict'
import test from 'node:test'

const base = process.env.BIKE_TOURS_TEST_ORIGIN || 'http://127.0.0.1:3035'
const canonicalOrigin = 'https://interlaken-bike-tours-prototype.web.app'
for (const path of [
  '/',
  '/destinations',
  '/destinations/interlaken',
  '/destinations/lauterbrunnen',
  '/destinations/lake-brienz',
  '/destinations/bern',
  '/destinations/lausanne',
  '/tours/interlaken-panorama',
  '/tours/lauterbrunnen-valley',
  '/tours/giessbach-waterfalls',
]) {
  test(`rendered preview metadata: ${path}`, async () => {
    const response = await fetch(base + path)
    const html = await response.text()
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
    assert.equal(
      html.match(/<link[^>]*rel="canonical"[^>]*href="([^" ]+)"/)?.[1],
      canonicalOrigin + path
    )
    assert.match(html, /name="robots" content="noindex, nofollow"/)
    assert.match(html, /application\/ld\+json/)
    assert.match(html, /Interlaken Bike Tours/)
    assert.match(html, /name="twitter:card" content="summary_large_image"/)
  })
}
test('preview sitemap excludes all tour URLs and unknown tours return 404', async () => {
  const sitemap = await fetch(base + '/sitemaps/static.xml')
  assert.equal(sitemap.status, 200)
  assert.doesNotMatch(await sitemap.text(), /<loc>/)
  assert.equal((await fetch(base + '/tours/unknown')).status, 404)
})
test('manifest and generated robots carry the same App origin and preview policy', async () => {
  const manifest = await fetch(base + '/manifest.webmanifest')
  assert.equal((await manifest.json()).name, 'Interlaken Bike Tours')
  const robots = await fetch(base + '/robots.txt')
  assert.equal(robots.status, 200)
  const text = await robots.text()
  assert.match(text, /Disallow: \/(?:\n|$)/)
  assert.ok(text.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`))
})

test('custom destinations disclose enquiry status and unknown destinations return 404', async () => {
  for (const destination of ['bern', 'lausanne']) {
    const html = await (
      await fetch(base + '/destinations/' + destination)
    ).text()
    assert.match(html, /Custom trip by enquiry/)
    assert.match(html, /https:\/\/wa.me\/41764659530/)
  }
  assert.equal((await fetch(base + '/destinations/unknown')).status, 404)
})
