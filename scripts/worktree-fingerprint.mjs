#!/usr/bin/env node
// @fireux-script
// last_used: 2026-08-02
// usage_note: gives gitsave a stage-independent fingerprint of every authored worktree change.

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream, lstatSync, readlinkSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const repoRoot = process.cwd()

function gitPaths(args) {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'buffer',
    maxBuffer: 64 * 1024 * 1024,
  })

  if (result.error || result.status !== 0) {
    const detail = result.stderr?.toString('utf8').trim()
    throw new Error(detail || `git ${args.join(' ')} failed`)
  }

  return result.stdout
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
}

function isInsideRepo(filePath) {
  const relativePath = path.relative(repoRoot, filePath)
  return (
    relativePath === '' ||
    (!relativePath.startsWith(`..${path.sep}`) &&
      relativePath !== '..' &&
      !path.isAbsolute(relativePath))
  )
}

async function updateFileHash(hash, relativePath) {
  const absolutePath = path.resolve(repoRoot, relativePath)
  if (!isInsideRepo(absolutePath)) {
    throw new Error(
      `Refusing to fingerprint path outside repository: ${relativePath}`
    )
  }

  hash.update(`path\0${relativePath}\0`)

  let stats
  try {
    stats = lstatSync(absolutePath)
  } catch (error) {
    if (error?.code === 'ENOENT') {
      hash.update('missing\0')
      return
    }
    throw error
  }

  hash.update(`mode\0${stats.mode}\0`)
  if (stats.isSymbolicLink()) {
    hash.update(`link\0${readlinkSync(absolutePath)}\0`)
    return
  }
  if (!stats.isFile()) {
    hash.update('non-file\0')
    return
  }

  hash.update('file\0')
  await new Promise((resolve, reject) => {
    const stream = createReadStream(absolutePath)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', resolve)
    stream.on('error', reject)
  })
  hash.update('\0')
}

const changedPaths = new Set([
  ...gitPaths([
    'diff',
    '--name-only',
    '--no-renames',
    '-z',
    '--no-ext-diff',
    'HEAD',
    '--',
  ]),
  ...gitPaths(['ls-files', '--others', '--exclude-standard', '-z']),
])
const hash = createHash('sha256')

for (const relativePath of [...changedPaths].sort((left, right) =>
  left.localeCompare(right)
)) {
  await updateFileHash(hash, relativePath)
}

console.log(hash.digest('hex'))
