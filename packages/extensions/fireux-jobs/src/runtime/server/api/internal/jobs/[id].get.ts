// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: exact-load only the signed-in author's Job.
import { defineEventHandler, getRouterParam } from 'h3'
import { getAuthorJob } from '../../../job/author.ts'

export default defineEventHandler(event =>
  getAuthorJob(event, getRouterParam(event, 'id'))
)
