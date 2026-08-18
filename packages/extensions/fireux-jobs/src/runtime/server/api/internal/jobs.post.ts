// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: create fixed-scope private Job drafts through Admin.
import { defineEventHandler, readBody } from 'h3'
import { createAuthorJob } from '../../../job/server/identity/author.ts'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  return createAuthorJob(event, body)
})
