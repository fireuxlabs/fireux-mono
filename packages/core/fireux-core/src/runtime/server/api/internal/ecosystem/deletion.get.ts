import { defineEventHandler } from 'h3'
import { readEcosystemDeletionImpact } from '../../../../ecosystem/server/deletion'

export default defineEventHandler((event) => readEcosystemDeletionImpact(event))
