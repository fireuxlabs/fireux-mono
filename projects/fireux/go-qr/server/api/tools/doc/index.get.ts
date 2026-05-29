import { defineEventHandler } from 'h3'
import { goQrToolResponse } from '../../../utils/goQrTools'

export default defineEventHandler((event) => goQrToolResponse(event, 'doc'))
