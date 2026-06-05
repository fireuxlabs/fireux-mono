import { defineEventHandler } from 'h3'
import { miseboxToolResponse } from '../../../utils/miseboxTools'

export default defineEventHandler((event) =>
  miseboxToolResponse(event, 'ordering')
)
