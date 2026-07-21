// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: expose only the signed-in author's bounded Job collection.
import { defineEventHandler } from 'h3'
import { listAuthorJobs } from '../../job/author.ts'

export default defineEventHandler(event => listAuthorJobs(event))
