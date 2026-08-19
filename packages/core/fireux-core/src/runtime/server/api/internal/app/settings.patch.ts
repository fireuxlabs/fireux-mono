import { defineEventHandler } from 'h3'
import { updateAppSettings } from '../../../../app/server/settings/update'

export default defineEventHandler((event) => updateAppSettings(event))
