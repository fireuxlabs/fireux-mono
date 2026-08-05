import type { FireuxMetaContent } from './meta-content.types'

export type * from './meta-content.types'

/** Type-preserving helper for authored `app/meta.ts` configuration. */
export function defineFireuxMeta<const T extends FireuxMetaContent>(
  meta: T
): T {
  return meta
}
