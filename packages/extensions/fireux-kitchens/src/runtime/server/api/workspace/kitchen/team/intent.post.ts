import { defineEventHandler, readBody } from 'h3'
import { interpretKitchenTeam } from '../../../../../kitchen/server/team/intent'
export default defineEventHandler(async (event) =>
  interpretKitchenTeam(event, await readBody(event))
)
