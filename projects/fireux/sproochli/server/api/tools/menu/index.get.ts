import { defineEventHandler } from 'h3'
import { sproochliToolResponse } from '../../../utils/sproochliTools'

export default defineEventHandler((event) => sproochliToolResponse(event, 'menu'))
