import { defineEventHandler, getQuery } from 'h3'
import { readKitchenAppTheme } from '../../../kitchen/app-theme.ts'

export default defineEventHandler(event =>
  readKitchenAppTheme(event, getQuery(event).kitchen_id)
)
