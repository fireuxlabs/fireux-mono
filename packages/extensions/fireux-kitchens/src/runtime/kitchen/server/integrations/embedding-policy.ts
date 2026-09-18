import { getResponseHeader, setResponseHeader, type H3Event } from 'h3'
import { resolveMenuTarget } from '../../../menu/server/ownership/target'
import {
  resolveDirectoryMenuScope,
  resolveTenantMenuScope,
} from '../../../menu/server/ownership/app-scope'
import { readKitchenAllowedWebsites } from './website-ordering'
import { websiteFrameAncestors } from '../../utils/allowed-websites'
import { embeddingResponseHeaders } from '../../utils/embedding-response'

/** One request's resolved Kitchen policy. A failed lookup never permits external framing. */
export async function applyKitchenEmbeddingPolicy(
  event: H3Event,
  target: { menuId?: string; kitchenSlug?: string }
) {
  const inherited = getResponseHeader(event, 'Content-Security-Policy')
  let policy = websiteFrameAncestors([])
  event.context.kitchenFrameAncestors = policy
  setResponseHeader(
    event,
    'Content-Security-Policy',
    String(
      embeddingResponseHeaders({}, policy, inherited)['content-security-policy']
    )
  )
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  try {
    const kitchenId = target.menuId
      ? (await resolveMenuTarget(target.menuId, target.kitchenSlug)).kitchenId
      : target.kitchenSlug
        ? (await resolveDirectoryMenuScope(target.kitchenSlug)).kitchenId
        : (await resolveTenantMenuScope())?.kitchenId
    if (kitchenId)
      policy = websiteFrameAncestors(
        await readKitchenAllowedWebsites(kitchenId),
        import.meta.dev
      )
  } catch {
    /* Route and data errors remain owned by the page; embedding stays closed. */
  }
  event.context.kitchenFrameAncestors = policy
  setResponseHeader(
    event,
    'Content-Security-Policy',
    String(
      embeddingResponseHeaders({}, policy, inherited)['content-security-policy']
    )
  )
}
