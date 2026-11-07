import { defineEventHandler } from 'h3'
import { updateAppPublicSettings } from '../../../../app/server/settings/update'

export default defineEventHandler((event) => updateAppPublicSettings(event))
