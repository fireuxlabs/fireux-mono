import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'
import {
  menuAppTheme,
  menuDisplayTokens,
} from '../runtime/menu/utils/menu-display-tokens.ts'

const source = readFileSync(
  new URL(
    '../runtime/menu/composables/useMenuThemeSurface.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export \{[^}]+\} from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')

test('page canvas cannot export Menu brand tokens into the host App', () => {
  let head
  const useSurface = compileFunction(
    `${stripTypeScriptTypes(source)}; return useMenuThemeSurface`,
    ['computed', 'toValue', 'menuAppTheme', 'menuDisplayTokens', 'useHead']
  )(computed, toValue, menuAppTheme, menuDisplayTokens, (value) => {
    head = value
  })
  const pageCanvas = ref(true)
  const theme = ref({
    palette: {
      canvas: '#171717',
      text: '#f7f1e6',
      accent: '#cfa85a',
      accent_contrast: '#171717',
    },
  })
  const surface = useSurface({ theme, pageCanvas })
  assert.equal(surface.styleVars.value['--ui-primary'], '#cfa85a')
  assert.equal(surface.styleVars.value['--ui-bg'], '#171717')
  assert.deepEqual(head.value.bodyAttrs.style, {
    '--menu-page-canvas-bg': '#171717',
    '--menu-page-canvas-text': '#f7f1e6',
  })
  assert.match(surface.className.value, /menu-theme--page-canvas/)
  assert.match(
    head.value.style[0].innerHTML,
    /body:has\(\.menu-theme--page-canvas\)/
  )
  assert.ok(
    !head.value.style[0].innerHTML.includes('#171717'),
    'palette values remain style attributes rather than authored style markup'
  )
  pageCanvas.value = false
  assert.deepEqual(head.value, {})
  assert.equal(surface.className.value, 'menu-theme--light')
})

test('unconfigured menus inherit host tokens and a saved Kitchen palette overrides only its surface', () => {
  const useSurface = compileFunction(
    `${stripTypeScriptTypes(source)}; return useMenuThemeSurface`,
    ['computed', 'toValue', 'menuAppTheme', 'menuDisplayTokens', 'useHead']
  )(computed, toValue, menuAppTheme, menuDisplayTokens, () => {})
  const themeSource = ref('default')
  const theme = ref({
    palette: {
      canvas: '#f8fafc',
      text: '#0f172a',
      accent: '#0f766e',
      accent_contrast: '#ffffff',
    },
  })
  const surface = useSurface({ theme, themeSource })
  assert.equal(surface.styleVars.value['--menu-bg'], 'var(--ui-bg)')
  assert.equal(surface.styleVars.value['--menu-primary'], 'var(--ui-primary)')
  assert.ok(
    !Object.keys(surface.styleVars.value).some((key) => key.startsWith('--ui-'))
  )
  themeSource.value = 'kitchen'
  assert.equal(surface.styleVars.value['--ui-primary'], '#0f766e')
  assert.equal(surface.styleVars.value['--ui-bg'], '#f8fafc')
  themeSource.value = 'default'
  assert.ok(
    !Object.keys(surface.styleVars.value).some((key) => key.startsWith('--ui-'))
  )
})
