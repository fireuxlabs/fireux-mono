// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: publish only complete, configured, reference-valid author Jobs.
import { defineEventHandler, getRouterParam } from 'h3'
import { publishAuthorJob } from '../../../../../job/server/identity/author.ts'

export default defineEventHandler(event =>
  publishAuthorJob(event, getRouterParam(event, 'id'))
)
