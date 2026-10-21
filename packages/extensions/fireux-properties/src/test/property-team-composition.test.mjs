import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = path => readFileSync(new URL(path, import.meta.url), 'utf8')

test('Property Team route resolves the domain component through existing registration', () => {
  const registrations = []
  const script = source('../config/module/components-config.ts')
    .replace(/^import .*\n/gm, '')
    .replace('export function', 'function')
  const configure = compileFunction(
    stripTypeScriptTypes(script) + '; return configureComponents',
    ['registerComponentsDir', 'addComponent']
  )((resolver, directory, options) => registrations.push({ directory, ...options }), () => {})
  configure({ resolve: value => value })
  const registration = registrations.find(row => row.directory === './runtime/property/components')
  assert.equal(registration.prefix, 'Property')
  assert.ok(!registration.ignore.some(pattern => pattern.startsWith('Team')))
  assert.ok(existsSync(new URL('../runtime/property/components/Team/Index.vue', import.meta.url)))
  assert.ok(!existsSync(new URL('../runtime/property/components/Workspace/Team', import.meta.url)))
  const route = source('../runtime/pages/workspace/property/team.vue')
  assert.match(route, /<PropertyTeam\s[^>]*:team="team"/)
  assert.doesNotMatch(route, /WorkspacePropertyTeam|components\/Workspace\/Team/)
  assert.match(route, /const team = usePropertyTeam\(\)/)
})
