import { defineEventHandler, getQuery } from 'h3'
import { kitchenRecordContext } from '../../../../kitchen/server/context/command'

export default defineEventHandler(async (event) =>
  kitchenRecordContext(event, getQuery(event), false)
)
