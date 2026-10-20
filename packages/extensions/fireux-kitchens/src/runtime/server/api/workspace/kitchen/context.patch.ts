import { defineEventHandler, readBody } from 'h3'
import { kitchenRecordContext } from '../../../../kitchen/server/context/command'

export default defineEventHandler(async (event) =>
  kitchenRecordContext(event, await readBody(event), true)
)
