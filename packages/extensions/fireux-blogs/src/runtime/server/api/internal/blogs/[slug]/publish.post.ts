import { defineEventHandler, readBody, getRouterParam } from 'h3'
import { publishBlogPost } from '../../../../../blog/server/authoring'
export default defineEventHandler(async event => publishBlogPost(event, getRouterParam(event, 'slug'), await readBody(event)))
