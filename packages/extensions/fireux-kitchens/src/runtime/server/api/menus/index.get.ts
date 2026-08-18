import { defineEventHandler } from 'h3'
import { readMenuIndex } from '../../../menu/server/index/read'

export default defineEventHandler(readMenuIndex)
