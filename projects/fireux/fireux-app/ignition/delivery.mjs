import {
  readFile,
  mkdir,
  open,
  rm,
  writeFile,
  rename,
  realpath,
} from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { randomUUID, createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createIgnitionSource } from './create.mjs'

export function parseWorkerOptions(args, { required = true } = {}) {
  const result = {}
  const flags = {
    '--queue-url': 'queueUrl',
    '--token-file': 'tokenFile',
    '--codex-bin': 'executable',
    '--codex-socket': 'socket',
  }
  for (let i = 0; i < args.length; i++) {
    const key = flags[args[i]],
      value = args[++i]
    if (!key || !value || value.startsWith('--') || result[key])
      throw new Error(
        'Use --queue-url URL --token-file PATH [--codex-bin PATH] [--codex-socket PATH].'
      )
    result[key] = value
  }
  if (required && (!result.queueUrl || !result.tokenFile))
    throw new Error(
      'Source creation requires the existing delivery queue: supply --queue-url and --token-file.'
    )
  return result
}

/** A local operator worker; the hosted App never opens a desktop connection. */
export async function deliverIgnition({
  root,
  queueUrl,
  tokenFile,
  input,
  requestId,
  executable,
  socket,
  fetcher = fetch,
  create = createIgnitionSource,
}) {
  root = await realpath(root)
  const base = new URL(queueUrl)
  if (
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    (base.protocol !== 'https:' &&
      !(
        base.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)
      ))
  )
    throw new Error(
      'Use an HTTPS queue or a local development origin without credentials.'
    )
  const token = (await readFile(tokenFile, 'utf8')).trim()
  if (!token || /\s/.test(token))
    throw new Error(
      'The token file must contain one current FireUX App admin ID token.'
    )
  const call = async (body) => {
    const response = await fetcher(
      new URL('/api/internal/control/ignition-requests/build', base),
      {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(30000),
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )
    if (!response.ok)
      throw new Error(
        `Ignition queue command failed (${response.status}); source/task progress is preserved. Check admin access and the queue before retrying.`
      )
    const result = await response.json()
    if (!result.ok || !result.build?.id)
      throw new Error('Invalid Ignition queue response.')
    return result.build
  }
  let job = input ? await call({ action: 'enqueue', input }) : { id: requestId }
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(job.id))
    throw new Error('Invalid queued build id.')
  const key = createHash('sha256')
    .update(`${base.origin}\0${job.id}`)
    .digest('hex')
  const cache = resolve(root, '.cache/ignition-delivery')
  await mkdir(cache, { recursive: true })
  if (!(await realpath(cache)).startsWith(`${root}/`))
    throw new Error('Worker receipts must stay inside the repository.')
  const claimPath = resolve(cache, `${key}.json`)
  const lockPath = `${claimPath}.lock`
  const lock = await open(lockPath, 'wx', 0o600)
  try {
    let claim
    try {
      claim = JSON.parse(await readFile(claimPath, 'utf8'))
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      claim = { token: randomUUID() }
      const file = await open(claimPath, 'wx', 0o600)
      try {
        await file.writeFile(JSON.stringify(claim))
      } finally {
        await file.close()
      }
    }
    job = await call({ action: 'claim', id: job.id, token: claim.token })
    if (job.task) return job
    let result
    try {
      result = claim.threadId
        ? { codexTaskResult: { status: 'existing', threadId: claim.threadId } }
        : await create({ root, input: job.input, executable, socket })
    } catch (error) {
      await call({
        action: 'report',
        id: job.id,
        token: claim.token,
        state: 'blocked',
      })
      throw error
    }
    if (result.codexTaskResult.threadId && !claim.threadId) {
      claim.threadId = result.codexTaskResult.threadId
      const temporary = `${claimPath}.${randomUUID()}.tmp`
      try {
        await writeFile(temporary, JSON.stringify(claim), {
          flag: 'wx',
          mode: 0o600,
        })
        await rename(temporary, claimPath)
      } finally {
        await rm(temporary, { force: true })
      }
    }
    return await call({
      action: 'report',
      id: job.id,
      token: claim.token,
      state:
        result.codexTaskResult.status === 'pending' ? 'task-pending' : 'ready',
      ...(result.codexTaskResult.threadId
        ? { threadId: result.codexTaskResult.threadId }
        : {}),
    })
  } finally {
    await lock.close()
    await rm(lockPath, { force: true })
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [requestId, ...args] = process.argv.slice(2)
  const result = await deliverIgnition({
    root: resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'),
    requestId,
    ...parseWorkerOptions(args),
  })
  console.log(JSON.stringify(result, null, 2))
  if (result.state !== 'ready') process.exitCode = 1
}
