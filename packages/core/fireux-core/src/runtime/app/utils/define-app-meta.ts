import type { FireuxMetaContent } from '../models/meta-content'

/** Type-preserving helper for authored `app/meta.ts` configuration. */
export function defineFireuxMeta<const T extends FireuxMetaContent>(
  meta: T
): T {
  return meta
}
