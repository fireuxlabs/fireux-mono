import { defineEventHandler, readBody } from 'h3'
import { ensureDefaultKitchenStation } from '../../../../../kitchen/server/stations/ensure-default'
export default defineEventHandler(async event => ensureDefaultKitchenStation(event, await readBody(event)))
