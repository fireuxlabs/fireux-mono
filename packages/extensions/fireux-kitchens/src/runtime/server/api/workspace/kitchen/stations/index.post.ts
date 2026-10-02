import { defineEventHandler, readBody } from 'h3'
import { createKitchenStation } from '../../../../../kitchen/server/stations/create'
export default defineEventHandler(async event => createKitchenStation(event, await readBody(event)))
