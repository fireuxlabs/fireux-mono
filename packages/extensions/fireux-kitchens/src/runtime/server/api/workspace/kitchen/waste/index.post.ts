import { defineEventHandler, readBody } from 'h3'
import { recordKitchenWaste } from '../../../../../kitchen/server/waste/record'
export default defineEventHandler(async event => recordKitchenWaste(event, await readBody(event)))
