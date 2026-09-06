import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { readFireuxProductContext } from '../../../fireux/context/product'
export default defineEventHandler((event) => {
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return readFireuxProductContext(event, getQuery(event).projectId)
})
