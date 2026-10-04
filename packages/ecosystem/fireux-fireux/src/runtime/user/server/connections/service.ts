import {
  ConnectionError,
  opaque,
  digest,
  requireOpaque,
  equalSecret,
  type ConnectionRecord,
} from 'fireux-core/runtime/user/server/connections/protocol'

export interface ConnectionTransaction {
  get(path: string): Promise<ConnectionRecord | null>
  set(path: string, data: ConnectionRecord): void
  delete(path: string): void
}
export interface ConnectionStore {
  transaction<T>(work: (tx: ConnectionTransaction) => Promise<T>): Promise<T>
}
export const connectionPath = (uid: string) =>
  `accounts/${digest(uid)}/connections/misebox`
const reversePath = (uid: string) =>
  `local_accounts/${digest(`misebox-78f9c:${uid}`)}`
const linkRequestPath = (request: string) =>
  `link_requests/${digest(requireOpaque(request))}`
const codePath = (code: string) => `login_codes/${digest(requireOpaque(code))}`
function liveRequest(record: ConnectionRecord | null, now: number) {
  if (!record || !Number.isFinite(record.expires) || record.expires <= now)
    throw new ConnectionError(
      410,
      'This connection link has expired. Start again from FireUX.'
    )
  return record
}

async function readSignIn(
  tx: ConnectionTransaction,
  code: string,
  state: string,
  verifier: string,
  now: number
) {
  requireOpaque(state)
  requireOpaque(verifier)
  const path = codePath(code)
  const record = await tx.get(path)
  if (!record || !Number.isFinite(record.expires) || record.expires <= now)
    throw new ConnectionError(
      410,
      'This sign-in link has expired. Start again from Misebox.'
    )
  const link = await tx.get(connectionPath(record.hubUid))
  if (
    record.consumed ||
    record.state !== state ||
    !equalSecret(record.challenge, digest(verifier)) ||
    !link ||
    link.revision !== record.revision ||
    link.localUid !== record.localUid
  )
    throw new ConnectionError(
      403,
      'This sign-in is no longer valid. Start again from Misebox.'
    )
  return { path, record }
}
function signInIdentity(record: ConnectionRecord) {
  return {
    hubUid: record.hubUid as string,
    localUid: record.localUid as string,
    authTime: record.authTime as number,
  }
}

/** Optional links between existing Auth accounts; no profile or membership writes. */
export function createConnectionService(
  store: ConnectionStore,
  now: () => number = Date.now
) {
  return {
    async beginLink(hubUid: string, label: string, binding: string) {
      const request = opaque()
      await store.transaction(async (tx) => {
        tx.set(linkRequestPath(request), {
          hubUid,
          hubLabel: label,
          binding: digest(binding),
          expires: now() + 10 * 60 * 1000,
          status: 'pending',
        })
      })
      return request
    },
    async inspectLink(request: string) {
      return store.transaction(async (tx) => {
        const record = liveRequest(
          await tx.get(linkRequestPath(request)),
          now()
        )
        if (record.status !== 'pending')
          throw new ConnectionError(
            409,
            'This connection has already been used. Start again from FireUX.'
          )
        return { hubLabel: record.hubLabel as string }
      })
    },
    async proveLink(request: string, localUid: string, localLabel: string) {
      return store.transaction(async (tx) => {
        const path = linkRequestPath(request)
        const record = liveRequest(await tx.get(path), now())
        if (
          record.status !== 'pending' ||
          (record.localUid && record.localUid !== localUid)
        )
          throw new ConnectionError(
            409,
            'This connection belongs to another account. Start again from FireUX.'
          )
        tx.set(path, { ...record, localUid, localLabel })
        return { ok: true as const }
      })
    },
    async completeLink(request: string, hubUid: string, binding: string) {
      return store.transaction(async (tx) => {
        const path = linkRequestPath(request)
        const record = liveRequest(await tx.get(path), now())
        if (
          record.hubUid !== hubUid ||
          !equalSecret(record.binding, digest(binding))
        )
          throw new ConnectionError(
            403,
            'Use the FireUX account and browser that started this connection.'
          )
        if (!record.localUid)
          throw new ConnectionError(409, 'Confirm your Misebox account first.')
        const link = await tx.get(connectionPath(hubUid))
        const reverse = await tx.get(reversePath(record.localUid))
        if (record.status === 'complete') {
          if (!link || link.revision !== record.revision)
            throw new ConnectionError(
              409,
              'This connection has been removed. Start again from FireUX.'
            )
          return { ok: true as const, localLabel: record.localLabel as string }
        }
        if (
          (link && link.localUid !== record.localUid) ||
          (reverse && reverse.hubUid !== hubUid)
        )
          throw new ConnectionError(
            409,
            'One of these accounts is already connected. Disconnect it before connecting another.'
          )
        const revision = link?.revision || opaque()
        tx.set(connectionPath(hubUid), {
          hubUid,
          localUid: record.localUid,
          localLabel: record.localLabel,
          revision,
          connectedAt: link?.connectedAt || now(),
        })
        tx.set(reversePath(record.localUid), { hubUid })
        tx.set(path, { ...record, status: 'complete', revision })
        return { ok: true as const, localLabel: record.localLabel as string }
      })
    },
    async disconnect(hubUid: string) {
      await store.transaction(async (tx) => {
        const link = await tx.get(connectionPath(hubUid))
        if (link) {
          tx.delete(connectionPath(hubUid))
          tx.delete(reversePath(link.localUid))
        }
      })
      return { ok: true as const }
    },
    async authorize(
      hubUid: string,
      state: string,
      challenge: string,
      authTime: number
    ) {
      requireOpaque(state)
      if (!/^[a-f0-9]{64}$/.test(challenge))
        throw new ConnectionError(
          400,
          'This sign-in link is invalid. Start again from Misebox.'
        )
      const code = opaque()
      await store.transaction(async (tx) => {
        const link = await tx.get(connectionPath(hubUid))
        if (!link)
          throw new ConnectionError(
            409,
            'Connect your Misebox account in FireUX before using shared sign-in.'
          )
        tx.set(codePath(code), {
          hubUid,
          localUid: link.localUid,
          revision: link.revision,
          state,
          challenge,
          authTime,
          expires: now() + 60 * 1000,
        })
      })
      return code
    },

    async preview(code: string, state: string, verifier: string) {
      return store.transaction(async (tx) =>
        signInIdentity(
          (await readSignIn(tx, code, state, verifier, now())).record
        )
      )
    },
    async exchange(code: string, state: string, verifier: string) {
      return store.transaction(async (tx) => {
        const { path, record } = await readSignIn(
          tx,
          code,
          state,
          verifier,
          now()
        )
        tx.set(path, { ...record, consumed: true })
        return signInIdentity(record)
      })
    },
  }
}
