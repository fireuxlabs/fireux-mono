import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'
import test from 'node:test'
const source = readFileSync(new URL('../runtime/project/composables/workspace/identity/useProjectWorkspaceIdentity.ts', import.meta.url), 'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '')
function harness() {
  const writes = [], published = []
  const access = { canWrite: ref(true) }
  const workspace = { id: ref('p'), data: ref({ id: 'p', name: 'Before', description: '', image_url: '' }), outcome: ref('ready'), crud: { update: async fields => writes.push(fields) } }
  const useIdentity = compileFunction(`${stripTypeScriptTypes(source)}; return useProjectWorkspaceIdentity`, ['computed', 'watchEffect', 'normalizeString', 'useProjectWorkspace', 'useProjectTeamData', 'useWorkspacePageState'])(computed, fn => fn(), value => String(value || '').trim(), () => workspace, () => access, () => ({ publish: value => published.push(value) }))
  return { identity: useIdentity(), workspace, access, writes, published }
}
const draft = { projectId: 'p', name: ' After  Name ', description: ' Notes ', imageUrl: 'https://example.com/logo.png' }
test('Identity updates only its bounded fields and publishes no full Project or Team', async () => {
  const h = harness(); await h.identity.update(draft)
  assert.deepEqual(h.writes, [{ name: 'After Name', description: 'Notes', image_url: draft.imageUrl }])
  assert.deepEqual(Object.keys(h.published[0]), ['identity', 'derived'])
})
test('Identity rejects lost management access and changed selection', async () => {
  const h = harness(); h.access.canWrite.value = false
  await assert.rejects(h.identity.update(draft), /management access/)
  h.access.canWrite.value = true
  await assert.rejects(h.identity.update({ ...draft, projectId: 'other' }), /selected Project changed/)
  assert.equal(h.writes.length, 0)
})
test('Identity validates names and image URLs but allows clearing an image', async () => {
  const h = harness()
  for (const invalid of [{ name: ' ' }, { name: 'x'.repeat(121) }, { description: 'x'.repeat(2001) }, { imageUrl: 'javascript:alert(1)' }, { imageUrl: 'https://user:password@example.com/image.png' }]) await assert.rejects(h.identity.update({ ...draft, ...invalid }))
  assert.equal(h.writes.length, 0)
  await h.identity.update({ ...draft, imageUrl: '' })
  assert.equal(h.writes[0].image_url, '')
})
test('Identity disables writes when a stale Project is retained under a new selected id', () => {
  const h = harness(); h.workspace.id.value = 'other'
  assert.equal(h.identity.canWrite.value, false)
})

test('AI prefill preserves untouched identity fields and only saves through human confirmation', async () => {
  const script = readFileSync(new URL('../runtime/project/components/Workspace/Identity/Write.vue', import.meta.url), 'utf8').split('<script setup lang="ts">')[1].split('</script>')[0].replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  const saved = []
  const identity = { canWrite: ref(true), projectId: ref('p'), name: ref('Before'), description: ref('Keep this'), imageUrl: ref('https://example.com/image.png'), update: async input => saved.push(input) }
  const api = compileFunction(`${stripTypeScriptTypes(script)}; return { show, save, name, description, imageUrl }`, ['computed', 'ref', 'defineProps', 'defineExpose', 'useToast'])(computed, ref, () => ({ identity }), () => {}, () => ({ add() {} }))
  api.show({ action: 'update', name: 'After', description: null, imageUrl: null, message: '' })
  assert.equal(api.name.value, 'After'); assert.equal(api.description.value, 'Keep this'); assert.equal(api.imageUrl.value, identity.imageUrl.value); assert.equal(saved.length, 0)
  await api.save(); assert.equal(saved.length, 1)
  api.show({ action: 'update', name: null, description: '', imageUrl: '', message: '' })
  assert.equal(api.description.value, ''); assert.equal(api.imageUrl.value, '')
})
