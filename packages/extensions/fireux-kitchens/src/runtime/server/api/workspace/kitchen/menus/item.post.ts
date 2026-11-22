import { defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import { createKitchenMenuItem } from '../../../../../menu/server/items/write'
export default defineEventHandler(async (event) =>
  createKitchenMenuItem(
    event,
    await readBody(event),
    useRuntimeConfig(event).kitchensWorkspaceOnly === true
  )
)
