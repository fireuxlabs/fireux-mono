import { defineEventHandler } from 'h3'
import { readUserDeletionImpact } from '../../../../user/server/deletion'

export default defineEventHandler((event) => readUserDeletionImpact(event))
