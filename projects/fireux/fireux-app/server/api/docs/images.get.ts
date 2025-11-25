import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import MarkdownIt from 'markdown-it'
import { createError } from 'h3'

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

export default defineEventHandler(async () => {
  try {
    const filePath = resolve(
      process.cwd(),
      '../../../packages/core/fireux-core/docs/images.md'
    )
    const source = await readFile(filePath, 'utf-8')
    const html = markdown.render(source)

    return {
      html,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load FireUX image specification markdown',
      cause: error,
    })
  }
})
