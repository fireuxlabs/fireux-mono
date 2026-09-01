import type { H3Event } from 'h3'
import { requireProjectOperator } from '../core/authority'

export async function requireProjectTestAuthority(
  event: H3Event,
  projectIdInput: unknown
) {
  return requireProjectOperator(event, projectIdInput)
}
