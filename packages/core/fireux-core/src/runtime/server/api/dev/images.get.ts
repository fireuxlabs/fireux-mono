import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

type ImageEntry = {
  urlPath: string
  filePath: string
}

type ImageGroup = {
  key: string
  title: string
  rootDir: string
  images: ImageEntry[]
}

const isImageFile = (name: string) =>
  /\.(png|jpg|jpeg|webp|svg|ico)$/i.test(name)

async function listImagesUnderPublicDir(publicDir: string): Promise<ImageEntry[]> {
  const imgDir = path.join(publicDir, 'img')

  const results: ImageEntry[] = []

  async function walk(dir: string) {
    let entries: Array<{ name: string; isDirectory: () => boolean }> = []
    try {
      entries = (await readdir(dir, { withFileTypes: true })) as any
    } catch {
      return
    }

    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
        continue
      }

      if (!isImageFile(entry.name)) continue

      const relFromPublic = path.relative(publicDir, full).split(path.sep).join('/')
      results.push({
        urlPath: `/${relFromPublic}`,
        filePath: full,
      })
    }
  }

  await walk(imgDir)

  results.sort((a, b) => a.urlPath.localeCompare(b.urlPath))
  return results
}

function getCorePublicDir(): string {
  // This file: src/runtime/server/api/dev/images.get.ts
  // Core public: src/runtime/public
  const here = fileURLToPath(import.meta.url)
  return path.resolve(path.dirname(here), '../../../public')
}

export default defineEventHandler(async () => {
  const groups: ImageGroup[] = []

  // App public dir (when running inside a project)
  const appPublic = path.join(process.cwd(), 'public')
  groups.push({
    key: 'app',
    title: 'App images',
    rootDir: appPublic,
    images: await listImagesUnderPublicDir(appPublic),
  })

  // fireux-core public dir
  const corePublic = getCorePublicDir()
  groups.push({
    key: 'core',
    title: 'Core images',
    rootDir: corePublic,
    images: await listImagesUnderPublicDir(corePublic),
  })

  // Ecosystem public dirs registered by ecosystem modules (server-only runtimeConfig)
  const config = useRuntimeConfig() as any
  const ecoDirs = (config?.fireuxDev?.ecosystemPublicDirs ?? []) as Array<{
    key?: string
    title?: string
    dir: string
  }>

  for (const [index, eco] of ecoDirs.entries()) {
    groups.push({
      key: eco.key ?? `ecosystem-${index}`,
      title: eco.title ?? 'Ecosystem images',
      rootDir: eco.dir,
      images: await listImagesUnderPublicDir(eco.dir),
    })
  }

  return {
    groups,
  }
})
