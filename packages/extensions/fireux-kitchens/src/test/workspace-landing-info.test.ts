import assert from 'node:assert/strict'
import test from 'node:test'
import { kitchenWorkspaceIntro } from '../runtime/kitchen/utils/kitchen-workspace-intro.ts'
import { resolveKitchenAllowance } from '../runtime/kitchen/utils/kitchen-capacity.ts'
import { projectWorkspaceIntro } from 'fireux-core/runtime/project/utils/project-workspace-intro'

test('Kitchen information explains retained access and blocked creation from the same Premium facts', () => {
  const allowance = resolveKitchenAllowance(
    {
      role: 'user',
      subscription: 'premium',
    },
    ['one', 'two', 'three', 'four']
  )
  const info = kitchenWorkspaceIntro({
    status: 'ready',
    count: 4,
    selected: true,
    canCreate: allowance.canAdd,
    canUpdate: true,
    accountReady: true,
    hasAccount: true,
    creationEnabled: true,
    allowance,
  })
  assert.equal(info.allowance?.used, 4)
  assert.equal(info.allowance?.limit, 1)
  assert.equal(
    info.tools?.find((tool) => tool.id === 'create')?.available,
    false
  )
  assert.match(
    info.tools?.find((tool) => tool.id === 'create')?.reason || '',
    /already have 4/
  )
  assert.equal(info.tools?.find((tool) => tool.id === 'read')?.available, true)
  assert.equal(
    info.tools?.find((tool) => tool.id === 'update')?.available,
    true
  )
  assert.match(info.allowance?.retained || '', /stay available/)
  assert.match(info.ai, /does not save or delete/)
})

test('Account loading does not publish a guessed Kitchen allowance or enable actions', () => {
  const info = kitchenWorkspaceIntro()
  assert.equal(info.allowance?.used, undefined)
  assert.equal(info.allowance?.limit, undefined)
  assert.equal(
    info.tools?.find((tool) => tool.id === 'create')?.available,
    false
  )
  assert.match(
    info.tools?.find((tool) => tool.id === 'create')?.reason || '',
    /loading/
  )
})

test('Project information preserves its existing allowance scope and published App ownership', () => {
  const info = projectWorkspaceIntro({
    status: 'ready',
    count: 2,
    canCreate: false,
    canUpdate: true,
    accountReady: true,
    hasAccount: true,
    configured: true,
    subscription: 'premium',
    used: 3,
    limit: 1,
    publishedIdentity: true,
  })
  assert.equal(info.allowance?.used, 3)
  assert.match(info.allowance?.description || '', /workspace associations/)
  assert.equal(
    info.tools?.find((tool) => tool.id === 'create')?.available,
    false
  )
  assert.match(
    info.tools?.find((tool) => tool.id === 'update')?.description || '',
    /connected App/
  )
  assert.equal(
    info.tools?.find((tool) => tool.id === 'update')?.available,
    true
  )
  assert.match(info.ai, /not connected/)
})

test('Unconfigured Project policy does not promise that upgrading fixes creation', () => {
  const info = projectWorkspaceIntro({
    status: 'ready',
    count: 1,
    canCreate: false,
    canUpdate: false,
    accountReady: true,
    hasAccount: true,
    configured: false,
    subscription: 'premium',
    used: 1,
    limit: 0,
    publishedIdentity: false,
  })
  assert.equal(info.allowance?.configured, false)
  assert.equal(info.allowance?.limit, undefined)
  assert.match(info.allowance?.description || '', /not configured/)
  assert.match(info.allowance?.description || '', /not a confirmed remedy/)
  assert.equal(
    info.tools?.find((tool) => tool.id === 'update')?.available,
    false
  )
})

test('A settled guest is asked to sign in rather than wait for account loading', () => {
  const info = kitchenWorkspaceIntro({
    status: 'empty',
    count: 0,
    selected: false,
    canCreate: false,
    canUpdate: false,
    accountReady: true,
    hasAccount: false,
    creationEnabled: true,
    allowance: resolveKitchenAllowance(null, []),
  })
  assert.match(
    info.tools?.find((tool) => tool.id === 'create')?.reason || '',
    /Sign in/
  )
  assert.equal(info.allowance?.used, undefined)
})
