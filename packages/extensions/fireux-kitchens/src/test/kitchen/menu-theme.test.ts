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

test('standalone Menu retains its own theme', () => {
  assert.deepEqual(
    resolveEffectiveMenuTheme(
      { theme: { palette: menuPalette } },
      { palette: kitchenPalette }
    ),
    { theme: { palette: menuPalette }, themeSource: 'menu' }
  )
})

test('Kitchen-owned Menu uses Kitchen palette', () => {
  assert.deepEqual(
    resolveEffectiveMenuTheme({ theme: { palette: menuPalette } }, { palette: kitchenPalette }, true),
    { theme: { palette: kitchenPalette }, themeSource: 'kitchen' }
  )
})

test('an unstyled Menu uses neutral defaults, not Place branding', () => {
  assert.deepEqual(resolveEffectiveMenuTheme({}, null), {
    theme: { palette: { canvas: '#f8fafc', text: '#0f172a', accent: '#0f766e', accent_contrast: '#ffffff' } },
    themeSource: 'default',
  })
})

test('Kitchen-owned Menu never falls back to a saved Menu palette', () => {
  const result = resolveEffectiveMenuTheme({ theme: { palette: menuPalette } }, null, true)
  assert.equal(result.themeSource, 'default')
  assert.notDeepEqual(result.theme.palette, menuPalette)
})
