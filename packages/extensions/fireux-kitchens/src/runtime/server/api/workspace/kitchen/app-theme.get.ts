import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { readKitchenAppTheme } from '../../../../kitchen/server/identity/app-theme.ts'

export default defineLiveReadHandler((event) =>
  readKitchenAppTheme(event, getQuery(event).kitchen_id)
)
