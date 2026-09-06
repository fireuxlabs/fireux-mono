import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { GuardedServerTransaction } from '../firestore-mutations/server-transaction'
import type { FirestoreMutationTarget } from '../../../types/firestore-mutations'
import { serverAuditStamp } from '../records/stamps'

type Target = FirestoreMutationTarget<string, 'server'>
// Organisational labels only. The domain authorises access before calling this.
export async function teamRolesCommand(
  tx: GuardedServerTransaction,
  roles: Target,
  members: Target,
  input: Record<string, unknown>,
  uid: string
) {
  const fail = (message: string): never => {
    throw createError({ statusCode: 400, statusMessage: message })
  }
  if (!input || typeof input !== 'object' || Array.isArray(input))
    fail('Invalid role request.')
  const action = input.action
  if (!['read', 'create', 'rename', 'assign'].includes(String(action)))
    fail('Unsupported role action.')
  const rows = await tx.readAll(roles, 101)
  if (rows.length > 100)
    fail('This workspace has too many roles to manage here.')
  const catalogue = rows.map((row) => ({
    id: row.id,
    name: String(row.data.name || ''),
  }))
  const memberId = typeof input.memberId === 'string' ? input.memberId : ''
  if (memberId.includes('/')) fail('Invalid member.')
  const member = memberId ? await tx.read(members, memberId) : null
  if (memberId && (!member?.exists || member.data?.status !== 'active'))
    fail('Select an active Team member.')
  if (action === 'read') {
    const people = await tx.readAll(members, 201)
    if (people.length > 200)
      fail('This Team is too large for the current role editor.')
    return {
      roles: catalogue,
      roleIds: Array.isArray(member?.data?.role_ids)
        ? member.data.role_ids
        : [],
      labels: Object.fromEntries(
        people.map((person) => [
          person.id,
          catalogue
            .filter(
              (role) =>
                Array.isArray(person.data.role_ids) &&
                person.data.role_ids.includes(role.id)
            )
            .map((role) => role.name),
        ])
      ),
    }
  }
  if (action === 'assign') {
    if (!memberId || !Array.isArray(input.roleIds) || input.roleIds.length > 20)
      fail('Choose up to 20 roles for an active member.')
    const ids = [...new Set(input.roleIds as unknown[])]
    if (
      ids.some(
        (id) =>
          typeof id !== 'string' || !catalogue.some((role) => role.id === id)
      )
    )
      fail('A selected role is no longer available in this workspace.')
    tx.update(members, memberId, {
      role_ids: ids as string[],
      updated: serverAuditStamp({ by: uid }),
    })
    return { ok: true }
  }
  const name =
    typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : ''
  if (!name || name.length > 80)
    fail('Enter a role name of up to 80 characters.')
  const id = typeof input.roleId === 'string' ? input.roleId : ''
  if (
    catalogue.some(
      (role) =>
        role.name.toLocaleLowerCase() === name.toLocaleLowerCase() &&
        (action !== 'rename' || role.id !== id)
    )
  )
    fail('That role already exists.')
  if (action === 'create') {
    if (rows.length >= 100) fail('This workspace already has 100 roles.')
    const roleId = randomUUID()
    tx.create(roles, roleId, { name, created: serverAuditStamp({ by: uid }) })
    return { ok: true, roleId }
  }
  if (!catalogue.some((role) => role.id === id)) fail('Role not found.')
  tx.update(roles, id, { name, updated: serverAuditStamp({ by: uid }) })
  return { ok: true, roleId: id }
}
