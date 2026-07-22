// Concurrent edit — 2026-07-22 12:24 CEST — Canonical Kitchen theme write: expose the trusted root mutation.
import { defineEventHandler, readBody } from 'h3'
import { updateKitchenTheme } from '../../../kitchen/theme.ts'

export default defineEventHandler(async event =>
  updateKitchenTheme(event, await readBody(event))
)
