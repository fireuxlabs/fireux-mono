import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: exact-load only the signed-in author's Job.
import { getRouterParam } from 'h3'
import { getAuthorJob } from '../../../../job/server/identity/author.ts'

export default defineLiveReadHandler((event) =>
  getAuthorJob(event, getRouterParam(event, 'id'))
)
