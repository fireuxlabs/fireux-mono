import { defineEventHandler, getRouterParam } from 'h3'
import { uploadSource } from '../../../menu-express/sources'
export default defineEventHandler((event) =>
  uploadSource(event, getRouterParam(event, 'id'))
)
