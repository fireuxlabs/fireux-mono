import { defineEventHandler, getQuery } from 'h3'
import { extractKitchenTeamDossier } from '../../../../../kitchen/server/team/dossier.ts'

export default defineEventHandler((event) =>
  extractKitchenTeamDossier(event, {
    kitchenId: String(getQuery(event).kitchenId || ''),
  })
)
