// Minimal Vite-like client typings used by apps/packages.
// We intentionally do not depend on `vite/client` being resolvable as a TS type lib.

interface ImportMetaEnv {
  readonly BASE_URL?: string
  readonly MODE?: string
  readonly DEV?: boolean
  readonly PROD?: boolean
  readonly SSR?: boolean
  readonly [key: string]: string | boolean | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
