import { readDocsManifest } from '~/utils/docsManifest.server'

export default defineEventHandler(async () => {
  const entries = await readDocsManifest()
  return entries
})
