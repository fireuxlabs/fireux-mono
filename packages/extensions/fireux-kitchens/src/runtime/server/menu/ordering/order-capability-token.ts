// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: isolate testable token generation and constant-time digest verification.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { readMenuOrderCapabilityToken } from '../../../utils/menu-order-capability.ts'

const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/

export function createMenuOrderCapability() {
  const token = randomBytes(32).toString('base64url')

  return {
    token,
    hash: hashMenuOrderCapability(token),
  }
}

export function hashMenuOrderCapability(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function matchesMenuOrderCapability(token: string, storedHash: string) {
  if (!readMenuOrderCapabilityToken(token)) return false
  if (!SHA256_HEX_PATTERN.test(storedHash)) return false

  const candidate = createHash('sha256').update(token).digest()
  const stored = Buffer.from(storedHash, 'hex')

  return (
    stored.length === candidate.length && timingSafeEqual(stored, candidate)
  )
}
