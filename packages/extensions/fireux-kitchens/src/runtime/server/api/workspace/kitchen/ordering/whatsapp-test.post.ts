import { defineEventHandler, readBody } from 'h3'
import { testKitchenOrderingWhatsApp } from '../../../../../kitchen/server/ordering/whatsapp-test'

export default defineEventHandler(async (event) =>
  testKitchenOrderingWhatsApp(event, await readBody(event))
)
