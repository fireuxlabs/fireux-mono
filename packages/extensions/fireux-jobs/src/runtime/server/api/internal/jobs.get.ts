import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: expose only the signed-in author's bounded Job collection.
import { listAuthorJobs } from '../../../job/server/identity/author.ts'

export default defineLiveReadHandler((event) => listAuthorJobs(event))
