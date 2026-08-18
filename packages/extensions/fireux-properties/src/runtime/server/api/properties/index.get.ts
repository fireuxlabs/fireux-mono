import { defineEventHandler, getQuery } from 'h3'
import { readPublicPropertyIndex } from '../../../property/server/index/public-index'

export default defineEventHandler((event) =>
  readPublicPropertyIndex(getQuery(event))
)
