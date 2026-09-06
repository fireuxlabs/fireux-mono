import { defineEventHandler, setResponseHeader } from 'h3'
import { readFireuxProductContext } from '../../../fireux/context/product'
export default defineEventHandler((event) => {
  setResponseHeader(event, 'cache-control', 'public, max-age=300')
  return readFireuxProductContext()
})
