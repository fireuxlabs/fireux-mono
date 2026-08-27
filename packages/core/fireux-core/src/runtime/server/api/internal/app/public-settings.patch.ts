import { defineEventHandler } from 'h3'
import { updateAppPublicSettings } from '../../../../app/server/settings/update-public'

export default defineEventHandler((event) => updateAppPublicSettings(event))
