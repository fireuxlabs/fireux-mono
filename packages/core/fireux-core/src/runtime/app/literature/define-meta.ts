import type { FireuxMetaContent } from './types'

/** Type-preserving helper for authored `app/meta.ts` configuration. */
export function defineFireuxMeta<const T extends FireuxMetaContent>(
  meta: T
): T {
  return meta
}
