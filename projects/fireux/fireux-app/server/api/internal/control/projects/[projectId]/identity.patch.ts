import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateProjectIdentity } from '../../../../../project/identity/update'

export default defineEventHandler(async event =>
  updateProjectIdentity(event, getRouterParam(event, 'projectId'), await readBody(event))
)
