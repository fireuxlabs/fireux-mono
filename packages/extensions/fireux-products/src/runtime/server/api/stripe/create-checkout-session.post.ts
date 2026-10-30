import { defineEventHandler, readBody } from 'h3'
import { createProductCheckout } from '../../../product/server/integration/stripe/checkout'

export default defineEventHandler(async (event) =>
  createProductCheckout(event, await readBody(event))
)
