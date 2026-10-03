import { defineEventHandler, readBody, getRouterParam } from 'h3'
import { updateBlogPost } from '../../../../blog/server/authoring'
export default defineEventHandler(async event => updateBlogPost(event, getRouterParam(event, 'slug'), await readBody(event)))
