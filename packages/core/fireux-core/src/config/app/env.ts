export function reqEnv(name: string): string {
  const value = process.env[name]
  if (typeof value !== 'string' || !value.trim()) {
    const isCi =
      process.env.CI === 'true' ||
      process.env.CI === '1' ||
      process.env.GITHUB_ACTIONS === 'true'
    const isTypecheck = process.argv.some((arg) => arg.includes('typecheck'))

    // During CI (especially on `pnpm install` -> `postinstall` -> `nuxi prepare`),
    // we don't require full runtime envs yet.
    if (isCi || isTypecheck) {
      if (name === 'APP_DOMAIN') return 'localhost'
      if (name === 'NUXT_FIREBASE_APP_ID') return 'ci'
    }

    throw new Error(`[fireux] Missing required env var: ${name}`)
  }
  return value.trim()
}

export function optEnv(name: string): string | undefined {
  const value = process.env[name]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}
