import { getAuth } from 'firebase-admin/auth'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { assertFixture, feeds, resetMetrics } from '../../utils/metrics'

export default defineEventHandler(async (event) => {
  assertFixture()
  const app = getAdminApp()
  if (app.options.projectId !== 'demo-fireux-live')
    throw new Error('Unexpected Admin project.')
  const { operation } = await readBody<{ operation: string }>(event)
  const db = getRuntimeFirestore('fireux')
  const kitchens = getRuntimeFirestore('misebox')
  const identity = getRuntimeFirestore('live-identity')
  const suffix = String(Date.now())
  const grant = db.doc('project_access/fireux-app/users/fixture-actor')
  if (operation === 'disconnect') {
    setTimeout(() => {
      for (const feed of [...feeds]) feed.destroy()
    }, 100)
  } else if (operation === 'reset-metrics') resetMetrics()
  else if (operation === 'kitchen-name')
    await kitchens
      .doc('places/place-000')
      .update({ name: `Kitchen changed ${suffix}` })
  else if (operation === 'kitchen-private')
    await kitchens
      .doc('kitchens/place-000')
      .update({ context: `PRIVATE_KITCHEN_MARKER ${suffix}` })
  else if (operation === 'kitchen-burst') {
    await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        kitchens
          .doc('places/place-000')
          .update({ name: `Kitchen burst ${suffix} ${index}` })
      )
    )
    await kitchens
      .doc('places/place-000')
      .update({ name: `Kitchen burst ${suffix} final` })
  } else if (operation === 'team-name')
    await db
      .doc('projects/project-a/team/local')
      .update({ name: `Team changed ${suffix}` })
  else if (operation === 'identity-name')
    await identity
      .doc('users/linked-user')
      .update({ display_name: `Identity changed ${suffix}` })
  else if (operation === 'decoy-name')
    await db
      .doc('users/linked-user')
      .update({ display_name: `Wrong database changed ${suffix}` })
  else if (operation === 'revoke-grant' || operation === 'restore-grant')
    await grant.update({
      ids: operation === 'restore-grant' ? ['project-a', 'project-b'] : [],
    })
  else if (operation === 'disable-user' || operation === 'enable-user')
    await getAuth(app).updateUser('fixture-actor', {
      disabled: operation === 'disable-user',
    })
  else if (operation === 'probe-fireux')
    await db.doc('probes/same').update({ value: `fireux ${suffix}` })
  else if (operation === 'probe-identity')
    await identity.doc('probes/same').update({ value: `identity ${suffix}` })
  else
    throw createError({
      statusCode: 400,
      statusMessage: 'Unknown fixture operation.',
    })
  return { ok: true, operation, suffix }
})
