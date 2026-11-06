import { parse, compileTemplate } from 'vue/compiler-sfc'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const repo = fileURLToPath(new URL('../../../../../', import.meta.url))
const runtime = join(repo, 'packages/core/fireux-core/src/runtime')

test('maintained App roots delegate stock lifecycle; only Go QR embeds its own outlet', () => {
  for (const group of readdirSync(join(repo, 'projects'), {
    withFileTypes: true,
  }).filter((entry) => entry.isDirectory())) {
    for (const app of readdirSync(join(repo, 'projects', group.name), {
      withFileTypes: true,
    }).filter((entry) => entry.isDirectory())) {
      const file = join(repo, 'projects', group.name, app.name, 'app/app.vue')
      if (!existsSync(file)) continue
      const source = readFileSync(file, 'utf8')
      assert.match(source, /<AppShell\b/, file)
      if (group.name === 'fireux' && app.name === 'go-qr') {
        assert.match(source, /route\.path\.startsWith\('\/tools\/'\)/)
      } else assert.doesNotMatch(source, /<(UApp|NuxtPage|Workspace)\b/, file)
    }
  }
})

test('AppShell keeps route and initialization ownership apart from developer controls', () => {
  const shell = readFileSync(join(runtime, 'app/components/Shell.vue'), 'utf8')
  const controls = readFileSync(
    join(runtime, 'app/components/DevControls.vue'),
    'utf8'
  )
  assert.equal((shell.match(/<UApp>/g) || []).length, 1)
  assert.equal((shell.match(/<NuxtPage\b/g) || []).length, 1)
  assert.match(shell, /<Workspace v-if="route\.meta\.workspacePage"/)
  assert.match(shell, /useAppRead\(fireuxConfig\.appId\)/)
  assert.match(shell, /appExists\.value === false/)
  assert.match(shell, /resolveSeoRobots/)
  assert.match(shell, /withBuildVersion/)
  assert.match(shell, /<AppDevControls\s*\/>/)
  assert.doesNotMatch(controls, /useAppRead|useAppInitialization|<NuxtPage/)
  assert.match(controls, /onBeforeUnmount/)
})

test('reviewed shared foundation templates compile with their named slots', () => {
  for (const file of [
    'app/components/Shell.vue',
    'app/components/DevControls.vue',
    'components/layouts/default/Header.vue',
    'components/layouts/default/Footer.vue',
    'components/layouts/default/FooterAdmins.vue',
    'components/layouts/shared/PlatformFooter.vue',
    'components/molecules/DisclosurePanel.vue',
    'components/molecules/DisclosureCard.vue',
  ]) {
    const { descriptor } = parse(readFileSync(join(runtime, file), 'utf8'))
    assert.deepEqual(
      compileTemplate({
        source: descriptor.template.content,
        filename: file,
        id: 'foundation-check',
      }).errors,
      [],
      file
    )
  }
})
