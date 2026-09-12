import { defineEventHandler, readBody } from 'h3'
import { syncConfiguredAppMedia } from '../../../../app/server/media/sync'

export default defineEventHandler(async (event) =>
  syncConfiguredAppMedia(event, await readBody(event))
)
