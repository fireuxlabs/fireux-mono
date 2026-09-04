import { defineEventHandler } from 'h3'
import { readAppDeletionImpact } from '../../../../app/server/deletion/index'

export default defineEventHandler((event) => readAppDeletionImpact(event))
