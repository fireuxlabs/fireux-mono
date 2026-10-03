import { defineEventHandler, readBody } from 'h3'
import { createBlogPost } from '../../../../blog/server/authoring'
export default defineEventHandler(async event => createBlogPost(event, await readBody(event)))
