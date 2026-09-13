import { getRouterParam } from 'h3'
import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { readPlatformEcosystem } from '../../utils/ecosystems'

export default defineLiveReadHandler(async event => ({
  ecosystem: await readPlatformEcosystem(getRouterParam(event, 'id') || ''),
}))
