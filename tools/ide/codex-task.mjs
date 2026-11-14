import { spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import {
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline'

const digest = (value) => createHash('sha256').update(value).digest('hex')
const inside = (root, candidate) => {
  const relative = path.relative(root, candidate)
  return (
    relative !== '' &&
    !relative.startsWith(`..${path.sep}`) &&
    relative !== '..' &&
    !path.isAbsolute(relative)
  )
}

async function saveReceipt(file, receipt) {
  const temporary = `${file}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, `${JSON.stringify(receipt, null, 2)}\n`, {
      flag: 'wx',
      mode: 0o600,
    })
    await rename(temporary, file)
  } finally {
    await rm(temporary, { force: true })
  }
}

function connect({ root, executable, socket, timeoutMs }) {
  const environment = { ...process.env }
  delete environment.OPENAI_API_KEY
  delete environment.FIREUX_AI_API_KEY
  const child = spawn(
    executable,
    ['app-server', 'proxy', ...(socket ? ['--sock', socket] : [])],
    {
      cwd: root,
      env: environment,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    }
  )
  const lines = createInterface({ input: child.stdout })
  const pending = new Map()
  const deadline = Date.now() + timeoutMs
  let sequence = 0
  let stopped
  let diagnostic = ''
  const fail = (error) => {
    stopped = error
    for (const entry of pending.values()) {
      clearTimeout(entry.timer)
      entry.reject(error)
    }
    pending.clear()
  }
  child.stderr.on('data', (chunk) => {
    diagnostic = (diagnostic + String(chunk)).slice(-1500)
  })
  child.on('error', (error) =>
    fail(new Error(`Codex proxy unavailable: ${error.message}`))
  )
  child.stdin.on('error', (error) =>
    fail(new Error(`Codex proxy input failed: ${error.message}`))
  )
  child.on('close', (code) => {
    const detail = diagnostic
      .replace(/Bearer\s+\S+|sk-[\w-]+/g, '[redacted]')
      .trim()
    fail(
      new Error(
        `Codex proxy closed (${code ?? 'signal'}).${detail ? ` ${detail}` : ' Check the running local app-server or configured socket.'}`
      )
    )
  })
  lines.on('line', (line) => {
    let message
    try {
      message = JSON.parse(line)
    } catch {
      fail(new Error('Codex proxy returned invalid JSON.'))
      return
    }
    if (message.method) return
    const entry = pending.get(message.id)
    if (!entry) return
    clearTimeout(entry.timer)
    pending.delete(message.id)
    if (message.error) {
      const error = new Error(
        `Codex ${entry.method} rejected: ${message.error.message ?? message.error.code}`
      )
      error.rpcRejected = true
      entry.reject(error)
    } else entry.resolve(message.result)
  })
  const request = (method, params) =>
    new Promise((resolve, reject) => {
      if (stopped || child.stdin.destroyed) {
        const error = new Error(
          stopped?.message ?? 'Codex proxy is not connected.'
        )
        error.notSent = true
        reject(error)
        return
      }
      const remaining = deadline - Date.now()
      if (remaining <= 0) {
        const error = new Error(
          'Codex task creation timed out before sending the next request.'
        )
        error.notSent = true
        reject(error)
        return
      }
      const id = ++sequence
      const timer = setTimeout(() => {
        pending.delete(id)
        reject(
          new Error(`Codex ${method} timed out; its outcome may be unknown.`)
        )
      }, remaining)
      pending.set(id, { method, resolve, reject, timer })
      child.stdin.write(`${JSON.stringify({ id, method, params })}\n`)
    })
  return {
    request,
    initialized() {
      if (stopped) throw stopped
      child.stdin.write(
        `${JSON.stringify({ method: 'initialized', params: {} })}\n`
      )
    },
    async close() {
      lines.close()
      child.stdin.end()
      if (child.exitCode !== null || child.signalCode !== null) return
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          child.kill('SIGTERM')
          resolve()
        }, 250)
        child.once('close', () => {
          clearTimeout(timer)
          resolve()
        })
      })
    },
  }
}

/** Create one local Codex handoff after source materialisation; never starts a daemon. */
export async function ensureCodexTask({
  root,
  task,
  executable = 'codex',
  socket,
  timeoutMs = 12_000,
}) {
  if (typeof root !== 'string' || !path.isAbsolute(root))
    throw new Error('Codex task root must be an absolute repository path.')
  if (
    !task ||
    ['key', 'title', 'prompt', 'ownerPath'].some(
      (key) => typeof task[key] !== 'string' || !task[key].trim()
    )
  )
    throw new Error('Codex task requires key, title, prompt and ownerPath.')
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
    throw new Error('Codex timeout must be positive.')
  if (
    typeof executable !== 'string' ||
    !executable.trim() ||
    (socket !== undefined &&
      (typeof socket !== 'string' || !path.isAbsolute(socket)))
  )
    throw new Error(
      'Codex executable must be nonempty and socket must be an absolute path.'
    )
  if (
    path.isAbsolute(task.ownerPath) ||
    task.ownerPath.includes('\\') ||
    task.ownerPath.split('/').includes('..')
  )
    throw new Error('Codex task ownerPath must stay inside the repository.')
  root = await realpath(root)
  const owner = await realpath(path.resolve(root, task.ownerPath))
  if (!inside(root, owner) || !(await stat(owner)).isDirectory())
    throw new Error(
      'Codex task ownerPath must name an existing directory inside the repository.'
    )
  const ownerPath = path.relative(root, owner).split(path.sep).join('/')
  const identity = {
    version: 1,
    root,
    key: task.key,
    ownerPath,
    title: task.title,
    promptHash: digest(task.prompt),
  }
  const cache = path.join(root, '.cache')
  await mkdir(cache, { recursive: true })
  if (!inside(root, await realpath(cache)))
    throw new Error('Codex task cache must stay inside the repository.')
  const directory = path.join(cache, 'ignition-codex')
  await mkdir(directory, { recursive: true })
  if (!inside(root, await realpath(directory)))
    throw new Error('Codex task receipts must stay inside the repository.')
  const receiptPath = path.join(
    directory,
    `${digest(`${task.key}\0${ownerPath}`)}.json`
  )
  const lockPath = `${receiptPath}.lock`
  let lock
  try {
    lock = await open(lockPath, 'wx', 0o600)
  } catch (error) {
    if (error.code === 'EEXIST')
      throw new Error(
        `Codex task creation is already locked. Inspect ${lockPath} before retrying.`
      )
    throw error
  }
  let connection
  try {
    let receipt
    try {
      receipt = JSON.parse(await readFile(receiptPath, 'utf8'))
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      receipt = { ...identity, state: 'pending' }
    }
    if (Object.entries(identity).some(([key, value]) => receipt[key] !== value))
      throw new Error(
        `Codex task receipt conflicts with this handoff: ${receiptPath}`
      )
    if (
      ![
        'pending',
        'starting',
        'started',
        'named',
        'starting-turn',
        'complete',
        'uncertain-start',
        'uncertain-turn',
      ].includes(receipt.state)
    )
      throw new Error(`Invalid Codex task receipt: ${receiptPath}`)
    if (receipt.state === 'starting' || receipt.state === 'uncertain-start')
      throw new Error(
        `Codex thread creation outcome is unknown. Reconcile ${receiptPath} with Codex before retrying; no duplicate was created by this retry.`
      )
    if (receipt.state === 'starting-turn' || receipt.state === 'uncertain-turn')
      throw new Error(
        `Codex handoff outcome is unknown for ${receipt.threadId}. Reconcile ${receiptPath} with Codex before retrying; no duplicate handoff was sent by this retry.`
      )
    if (
      receipt.state !== 'pending' &&
      (typeof receipt.threadId !== 'string' || !receipt.threadId)
    )
      throw new Error(
        `Codex task receipt is missing its thread ID: ${receiptPath}`
      )
    if (
      (receipt.state === 'pending' && receipt.threadId) ||
      (receipt.state === 'complete' &&
        (typeof receipt.turnId !== 'string' || !receipt.turnId))
    )
      throw new Error(`Invalid Codex task receipt state: ${receiptPath}`)
    const result = (status) => ({
      status,
      threadId: receipt.threadId,
      url: `codex://threads/${encodeURIComponent(receipt.threadId)}`,
      receiptPath,
    })
    if (receipt.state === 'complete') return result('existing')
    connection = connect({ root, executable, socket, timeoutMs })
    await connection.request('initialize', {
      clientInfo: {
        name: 'fireux_ignite',
        title: 'FireUX Ignition',
        version: '1.0.0',
      },
    })
    connection.initialized()
    if (receipt.threadId)
      await connection.request('thread/resume', {
        threadId: receipt.threadId,
        excludeTurns: true,
      })
    let created = false
    if (receipt.state === 'pending') {
      receipt.state = 'starting'
      await saveReceipt(receiptPath, receipt)
      let started
      try {
        started = await connection.request('thread/start', {
          cwd: root,
          ephemeral: false,
        })
      } catch (error) {
        receipt.state =
          error.rpcRejected || error.notSent ? 'pending' : 'uncertain-start'
        await saveReceipt(receiptPath, receipt)
        if (receipt.state === 'uncertain-start')
          error.message += ` Thread creation outcome is unknown; reconcile ${receiptPath} before retrying.`
        throw error
      }
      if (typeof started?.thread?.id !== 'string' || !started.thread.id)
        throw new Error(
          `Codex returned no thread ID. Reconcile ${receiptPath} before retrying.`
        )
      receipt = { ...receipt, threadId: started.thread.id, state: 'started' }
      await saveReceipt(receiptPath, receipt)
      created = true
    }
    if (receipt.state === 'started') {
      await connection.request('thread/name/set', {
        threadId: receipt.threadId,
        name: task.title,
      })
      receipt.state = 'named'
      await saveReceipt(receiptPath, receipt)
    }
    receipt.state = 'starting-turn'
    await saveReceipt(receiptPath, receipt)
    let started
    try {
      started = await connection.request('turn/start', {
        threadId: receipt.threadId,
        input: [{ type: 'text', text: task.prompt }],
      })
    } catch (error) {
      receipt.state =
        error.rpcRejected || error.notSent ? 'named' : 'uncertain-turn'
      await saveReceipt(receiptPath, receipt)
      if (receipt.state === 'uncertain-turn')
        error.message += ` Handoff outcome is unknown for ${receipt.threadId}; reconcile ${receiptPath} before retrying.`
      throw error
    }
    if (typeof started?.turn?.id !== 'string' || !started.turn.id)
      throw new Error(
        `Codex returned no turn ID. Reconcile ${receiptPath} before retrying.`
      )
    receipt = { ...receipt, turnId: started.turn.id, state: 'complete' }
    await saveReceipt(receiptPath, receipt)
    return result(created ? 'created' : 'existing')
  } finally {
    await connection?.close()
    await lock.close()
    await rm(lockPath, { force: true })
  }
}
