import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref, watch, compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { placeIdentityMedia } from '../runtime/place/utils/place-identity-media.ts'
const runtime = new URL('../runtime/', import.meta.url)
function component(path, props, deps = {}, result = '{}') {
  const source = readFileSync(new URL(path, runtime), 'utf8')
  const script = source
    .match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const bindings = {
    computed,
    ref,
    watch,
    defineOptions() {},
    defineProps: () => props,
    ...deps,
  }
  const state = compileFunction(
    `${stripTypeScriptTypes(script)}; return ${result}`,
    Object.keys(bindings)
  )(...Object.values(bindings))
  const app = createSSRApp({
    setup: () => ({ ...props, ...state }),
    render: compile(
      source
        .match(/<template>([\s\S]*?)<\/template>\s*<script/)[1]
        .replace(/ as HTMLInputElement \| null/g, '')
    ),
  })
  app.config.warnHandler = () => {}
  for (const name of ['UCard', 'UButton', 'PlaceEditBackdrop'])
    app.component(name, {
      setup:
        (_, { slots }) =>
        () =>
          h('div', slots.default?.()),
    })
  return renderToString(app)
}
test('Place identity consistently prefers a logo while photos never inherit its saved backdrop', () => {
  assert.deepEqual(
    placeIdentityMedia({
      logo_image: '/logo.png',
      image_url: '/photo.jpg',
      media_backdrop_color: '#ffffff',
    }),
    { imageUrl: '/logo.png', imageFit: 'contain', imageBackground: '#ffffff' }
  )
  assert.deepEqual(
    placeIdentityMedia({
      image_url: '/photo.jpg',
      media_backdrop_color: '#ffffff',
    }),
    { imageUrl: '/photo.jpg', imageFit: 'cover' }
  )
  assert.deepEqual(placeIdentityMedia(null), {
    imageUrl: '',
    imageFit: 'cover',
  })
})
test('A wordmark does not turn the header profile photo into logo artwork', async () => {
  const html = await component(
    'place/components/Header.vue',
    {
      place: {
        name: 'Venue',
        image_url: '/photo.jpg',
        wordmark_image: '/wordmark.png',
        media_backdrop_color: '#ffffff',
      },
    },
    { placeIdentityMedia },
    '({ identityImageUrl, hasBrandIdentity, identityStyle, brandStyle, initials, placeName, actions, hasUsableCover, coverUrl, wordmarkUrl, identityImageFailed, wordmarkFailed })'
  )
  assert.match(html, /place-header__identity--photo/)
  assert.match(html, /src="\/photo.jpg"/)
  assert.match(
    html,
    /place-header__wordmark[^>]*style="--fx-place-media-bg:#ffffff;/
  )
  assert.doesNotMatch(
    html,
    /place-header__identity[^>]*style="--fx-place-media-bg/
  )
})
test('Brand editor previews a profile photo without the logo backdrop, and retains it for artwork', async () => {
  const update = () => {}
  const html = await component(
    'place/components/Edit/Brand.vue',
    {
      place: {
        image_url: '/photo.jpg',
        logo_image: '/logo.png',
        wordmark_image: '/wordmark.png',
        media_backdrop_color: '#ffffff',
      },
    },
    {
      useImageStorage: () => ({ uploadImage: update }),
      usePlaceUpdate: () => ({
        updatePlaceImage: update,
        updateLogoImage: update,
        updateWordmarkImage: update,
        captureIntent: () => () => true,
      }),
    },
    '({ assets, inputs, busy, error, upload, remove })'
  )
  assert.match(html, /brand-asset__preview--photo[^>]*style=""/)
  assert.equal((html.match(/background:#ffffff/g) || []).length, 2)
})
