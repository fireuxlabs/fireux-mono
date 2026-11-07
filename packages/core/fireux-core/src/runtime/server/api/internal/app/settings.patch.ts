import { defineEventHandler } from 'h3'
import { updateAppIdentity } from '../../../../app/server/identity/update'

export default defineEventHandler((event) => updateAppIdentity(event))
