import { defineEventHandler, readBody } from 'h3'
import { createKitchenMenuDocumentFromSource } from '../../../../../menu/server/source/document'

export default defineEventHandler(async (event) =>
  createKitchenMenuDocumentFromSource(event, await readBody(event))
)
