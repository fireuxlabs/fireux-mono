import { defineEventHandler } from 'h3'
import { executeAppDeletion } from '../../../../app/server/deletion/index'

export default defineEventHandler((event) => executeAppDeletion(event))
