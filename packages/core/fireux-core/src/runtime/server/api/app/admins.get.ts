import { defineLiveReadHandler } from '../../utils/http/defineLiveReadHandler'
import { setResponseHeaders } from 'h3'
import { readAppAdmins } from '../../../app/server/index/admins'

export default defineLiveReadHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control':
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  })
  return readAppAdmins(event)
})
