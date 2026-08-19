import { defineEventHandler } from 'h3'
import { syncConfiguredAppMedia } from '../../../../app/server/media/sync'

export default defineEventHandler((event) => syncConfiguredAppMedia(event))
