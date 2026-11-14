import { createHash } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import { createError } from 'h3'
import type { DocumentData } from 'firebase-admin/firestore'
import { prepareIgnitionPreview } from '../../shared/ignition-preview.ts'

type Row = DocumentData
type Store = {
  read(id: string): Promise<Row | undefined>
  create(id: string, value: Row): void
  update(id: string, value: Row): void
}
const reject = (message: string) => {
  throw createError({ statusCode: 409, statusMessage: message })
}
const hash = (value: string) => createHash('sha256').update(value).digest('hex')
const validId = (value: unknown) =>
  typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value)

export function buildView(id: string, build: Row) {
  return {
    id,
    input: build.input,
    state: build.state,
    sourcePath: prepareIgnitionPreview(build.input).sourcePath,
    task: build.thread_id
      ? {
          id: build.thread_id,
          url: `codex://threads/${encodeURIComponent(build.thread_id)}`,
        }
      : null,
  }
}

/** Called only inside the App-admin guarded Conversation transaction. */
export async function advanceIgnitionBuild(
  store: Store,
  body: Row,
  actor: { appId: string; uid: string; at: unknown }
) {
  const action = body?.action
  const allowed =
    action === 'enqueue'
      ? ['action', 'input', 'requestId']
      : action === 'claim'
        ? ['action', 'id', 'token']
        : action === 'report'
          ? ['action', 'id', 'token', 'state', 'threadId']
          : []
  if (
    !allowed.length ||
    Object.keys(body).some((key) => !allowed.includes(key))
  )
    reject('Invalid build command.')
  if (action === 'enqueue') {
    const artifact = prepareIgnitionPreview(body.input)
    const id = `ignition-build-${artifact.input.id}`
    if (body.requestId !== undefined && !validId(body.requestId))
      reject('Invalid request id.')
    const existing = await store.read(id)
    const original =
      body.requestId && body.requestId !== id
        ? await store.read(body.requestId)
        : undefined
    if (
      body.requestId &&
      body.requestId !== id &&
      (!original ||
        original.kind !== 'ignition' ||
        !['accepted', 'in-progress'].includes(original.ignition?.stage))
    )
      reject('Accept the request before preparing its build.')
    if (
      original?.ignition?.forwarded_to &&
      original.ignition.forwarded_to !== id
    )
      reject('This request already owns another build.')
    if (
      existing &&
      (existing.kind !== 'ignition' ||
        !existing.ignition?.build ||
        !isDeepStrictEqual(existing.ignition.build.input, artifact.input))
    )
      reject(
        'This project id already has a different build. Nothing was replaced.'
      )
    if (
      existing &&
      !['accepted', 'in-progress', 'launched'].includes(existing.ignition.stage)
    )
      reject('This build is not accepted.')
    const build = existing?.ignition.build ?? {
      input: artifact.input,
      state: 'queued',
    }
    if (!existing)
      store.create(id, {
        app_id: actor.appId,
        kind: 'ignition',
        status: 'pending',
        created: { at: actor.at, by: actor.uid, app_id: actor.appId },
        updated: { at: actor.at, by: actor.uid },
        guest_contact: { company: artifact.input.name },
        ignition: {
          delivery: original?.ignition?.delivery ?? {},
          stage: 'accepted',
          build,
          app_job: artifact.input.outcome,
          original_request_id: body.requestId ?? null,
        },
      })
    if (original)
      store.update(body.requestId, {
        'ignition.forwarded_to': id,
        updated: { at: actor.at, by: actor.uid },
      })
    return buildView(id, build)
  }
  if (
    !validId(body.id) ||
    typeof body.token !== 'string' ||
    !/^[a-f0-9-]{36,128}$/.test(body.token)
  )
    reject('Invalid worker claim.')
  const source = await store.read(body.id)
  const build = source?.ignition?.build
  if (
    source?.kind !== 'ignition' ||
    !build ||
    !['accepted', 'in-progress', 'launched'].includes(source.ignition.stage)
  )
    reject('Accepted build not found.')
  if (action === 'claim' && build.thread_id) return buildView(body.id, build)
  const claim = hash(body.token)
  if (
    build.claim_hash &&
    (build.claim_hash !== claim || build.worker_uid !== actor.uid)
  )
    reject(
      'Another worker owns this build. Reconcile its claim before transferring it.'
    )
  if (action === 'report' && !build.claim_hash)
    reject('Claim this build before reporting it.')
  const next = { ...build }
  if (action === 'claim')
    Object.assign(next, {
      claim_hash: claim,
      worker_uid: actor.uid,
      state: 'preparing',
    })
  else {
    if (!['ready', 'task-pending', 'blocked'].includes(body.state))
      reject('Invalid build outcome.')
    if (body.state === 'ready' && !validId(body.threadId))
      reject('A completed build requires its Codex task id.')
    if (body.state !== 'ready' && body.threadId !== undefined)
      reject('Only a completed build can link a task.')
    if (
      build.thread_id &&
      (body.state !== 'ready' || body.threadId !== build.thread_id)
    )
      reject('The linked task cannot be replaced or cleared.')
    next.state = body.state
    if (body.state === 'ready') next.thread_id = body.threadId
  }
  store.update(body.id, {
    'ignition.build': next,
    'ignition.stage': 'in-progress',
    updated: { at: actor.at, by: actor.uid },
  })
  return buildView(body.id, next)
}
