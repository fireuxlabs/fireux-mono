export default defineEventHandler(async () => {
  const { db } = admin()
  const data = (await db.doc('kitchens/a').get()).data()
  if (data?.published !== true) throw createError({ statusCode: 404 })
  return { name: data.name, database: db.databaseId }
})
