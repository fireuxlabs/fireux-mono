import assert from 'node:assert/strict'
import test from 'node:test'
import {
  readAppPaletteLayer,
  resolveAppPalette,
} from '../../runtime/utils/theme-palette.ts'

test('App presentation resolves its own layer over Workspace without mixing brand-colour keys', () => {
  const workspace = {
    canvas: '#ffffff',
    text: '#111111',
    accent: '#123456',
    accent_contrast: '#ffffff',
  }
  const layer = {
    surface: '#eeeeee',
    canvas_inverted: '#111111',
    text_muted: '#666666',
    ink: '#000000',
    accent: '#abcdef',
  }
  assert.deepEqual(resolveAppPalette(workspace, layer), {
    ...workspace,
    ...layer,
  })
  assert.deepEqual(workspace, {
    canvas: '#ffffff',
    text: '#111111',
    accent: '#123456',
    accent_contrast: '#ffffff',
  })
  assert.equal(readAppPaletteLayer({ primary_color: '#123456' }), null)
  assert.equal(resolveAppPalette(workspace, { ...layer, accent: 'red' }), null)
})
