export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) throw createError({ statusCode: 401 })
  const { db, auth } = admin()
  const { uid } = await auth.verifyIdToken(token).catch(() => {
    throw createError({ statusCode: 401 })
  })
  const { name } = await readBody(event)
  if (typeof name !== 'string' || !name.trim())
    throw createError({ statusCode: 400 })
  await db.runTransaction(async (tx) => {
    const grant = await tx.get(db.doc('grants/' + uid))
    const membership = await tx.get(db.doc('apps/probe/users/' + uid))
    const stamp = membership.data()?.created.at
    if (
      grant.data()?.allowed !== true ||
      !stamp?.isEqual(grant.data()?.membership_created_at)
    )
      throw createError({ statusCode: 403 })
    tx.update(db.doc('kitchens/a'), { name })
  })
  return { name }
})
