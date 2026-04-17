import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { createError, defineEventHandler, readBody } from 'h3'

const execFileAsync = promisify(execFile)

function findRepoRoot(start: string): string {
  let current = start

  for (let i = 0; i < 10; i += 1) {
    const scriptPath = join(
      current,
      'scripts',
      'docs',
      'project-draft-check.mjs'
    )
    if (existsSync(scriptPath)) return current

    const parent = resolve(current, '..')
    if (parent === current) break
    current = parent
  }

  return start
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => null)) ?? {}
  const expectedObjects = Array.isArray(body?.expectedObjects)
    ? body.expectedObjects
        .map((value: unknown) => String(value || '').trim())
        .filter(Boolean)
    : ['Project', 'App', 'Ecosystem']

  const repoRoot = findRepoRoot(process.cwd())
  const scriptPath = join(
    repoRoot,
    'scripts',
    'docs',
    'project-draft-check.mjs'
  )

  if (!existsSync(scriptPath)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Project draft check script is missing.',
    })
  }

  try {
    const { stdout } = await execFileAsync(
      process.execPath,
      [scriptPath, '--expected', expectedObjects.join(',')],
      {
        cwd: repoRoot,
        maxBuffer: 1024 * 1024,
      }
    )

    return JSON.parse(stdout)
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Project draft check failed.',
      data:
        error instanceof Error
          ? { message: error.message }
          : { message: 'Unknown project draft check failure.' },
    })
  }
})
