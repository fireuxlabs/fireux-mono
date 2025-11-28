import type { NuxtConfig } from 'nuxt/schema'
import { env } from './env'
import { mergeNitroExternals } from './module-utils'

const firebaseNitroExternalPackages = [
  'firebase-admin',
  'firebase-functions',
  '@google-cloud/firestore',
  '@google-cloud/storage',
]

type NitroOptions = NonNullable<NuxtConfig['nitro']>

export function createNitroConfig(
  baseNitro: NuxtConfig['nitro'] | undefined
): NitroOptions {
  const nitro = { ...(baseNitro ?? {}) } as NitroOptions
  const preset = (nitro.preset ??
    env('FIREUX_NITRO_PRESET') ??
    'firebase') as NitroOptions['preset']

  nitro.preset = preset

  if (preset === 'firebase') {
    const defaults = { gen: 2, nodeVersion: '22' } as Record<string, any>
    nitro.firebase = {
      ...defaults,
      ...(nitro.firebase ?? {}),
    } as NitroOptions['firebase']
    nitro.externals = mergeNitroExternals(
      nitro.externals,
      firebaseNitroExternalPackages
    )
  }

  return nitro
}
