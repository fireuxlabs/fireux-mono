import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveEffectiveMenuTheme } from '../../server/menu/payload/theme.ts'

const kitchenPalette = {
  canvas: '#f6f6f3',
  text: '#17201a',
  accent: '#004117',
  accent_contrast: '#ffffff',
}
const menuPalette = {
  canvas: '#171717',
  text: '#f7f1e6',
  accent: '#cfa85a',
  accent_contrast: '#171717',
}

test('Menu theme overrides Kitchen theme', () => {
  assert.deepEqual(
    resolveEffectiveMenuTheme(
      { theme: { palette: menuPalette } },
      { palette: kitchenPalette },
      {}
    ),
    { theme: { palette: menuPalette }, themeSource: 'menu' }
  )
})

test('removing the Menu theme restores Kitchen inheritance', () => {
  assert.deepEqual(
    resolveEffectiveMenuTheme({}, { palette: kitchenPalette }, {}),
    { theme: { palette: kitchenPalette }, themeSource: 'kitchen' }
  )
})

test('Place-derived defaults remain the final bounded fallback', () => {
  assert.deepEqual(
    resolveEffectiveMenuTheme({}, null, {
      background_color_light: '#eeeeee',
      font_color_light: '#111111',
      primary_color: '#336699',
    }),
    {
      theme: {
        palette: {
          canvas: '#eeeeee',
          text: '#111111',
          accent: '#336699',
          accent_contrast: '#ffffff',
        },
      },
      themeSource: 'place-default',
    }
  )
})
