import { defineEventHandler } from 'h3'
import { executeEcosystemDeletion } from '../../../../ecosystem/server/deletion'

export default defineEventHandler((event) => executeEcosystemDeletion(event))
