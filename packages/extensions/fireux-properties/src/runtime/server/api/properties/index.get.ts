import { defineEventHandler, getQuery } from 'h3'
import { readPropertyDirectoryPage } from '../../../property/server/index/read'

export default defineEventHandler((event) =>
  readPropertyDirectoryPage(getQuery(event))
)
