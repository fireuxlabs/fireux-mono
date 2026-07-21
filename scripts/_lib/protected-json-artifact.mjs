// @fireux-script
// last_used: 2026-07-21
// usage_note: shared exclusive mode-0600 JSON artifact writer for named operational scripts.
// Concurrent edit — 2026-07-21 14:13 CEST — Werkbox Firebase hardening: write the read-only record-level migration plan as a protected artifact.
// Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: centralize protected JSON backup mechanics only.

import { createHash } from 'node:crypto'
import { open, unlink } from 'node:fs/promises'

export async function writeProtectedJsonArtifact({ path, payload }) {
  const json = JSON.stringify(payload, null, 2)
  if (json === undefined) {
    throw new Error('Protected JSON artifact payload is not serializable.')
  }

  const source = `${json}\n`
  const handle = await open(path, 'wx', 0o600)
  try {
    await handle.writeFile(source, { encoding: 'utf8' })
    await handle.chmod(0o600)
    await handle.sync()
    const file = await handle.stat()
    if (!file.isFile() || (file.mode & 0o777) !== 0o600) {
      throw new Error(
        'Protected JSON artifact must be a mode-0600 regular file.'
      )
    }
  } catch (error) {
    await handle.close().catch(() => {})
    await unlink(path).catch(() => {})
    throw error
  }
  await handle.close()

  return {
    path,
    sha256: createHash('sha256').update(source).digest('hex'),
  }
}
