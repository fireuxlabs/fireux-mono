import { defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import { createKitchenShell } from '../../../../kitchen/server/index/onboarding/create-shell'

export default defineEventHandler(async (event) =>
  createKitchenShell(
    event,
    await readBody(event),
    useRuntimeConfig(event).kitchensWorkspaceOnly !== true
  )
)
