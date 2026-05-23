import { defineEventHandler } from 'h3'
import { listQrdocDocuments } from '../../utils/qrdocDocuments'

export default defineEventHandler(async () => {
  const documents = await listQrdocDocuments()

  return {
    ok: true,
    documents,
  }
})
