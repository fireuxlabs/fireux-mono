import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveEffectiveMenuTheme } from '../../runtime/menu/server/payload/theme.ts'

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
      { palette: kitchenPalette }
    ),
    { theme: { palette: menuPalette }, themeSource: 'menu' }
  )
})

test('removing the Menu theme restores Kitchen inheritance', () => {
  assert.deepEqual(
    resolveEffectiveMenuTheme({}, { palette: kitchenPalette }),
    { theme: { palette: kitchenPalette }, themeSource: 'kitchen' }
  )
})

test('an unstyled Menu uses neutral defaults, not Place branding', () => {
  assert.deepEqual(resolveEffectiveMenuTheme({}, null), {
    theme: { palette: { canvas: '#f8fafc', text: '#0f172a', accent: '#0f766e', accent_contrast: '#ffffff' } },
    themeSource: 'default',
  })
})
