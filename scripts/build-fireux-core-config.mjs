// FILE: scripts/build-fireux-core-config.mjs
// Build FireUX core config helpers that package builds load through subpath exports.

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const packageRoot = join(repoRoot, 'packages/core/fireux-core')
const sourceRoot = join(packageRoot, 'src/config')
const outputRoot = join(packageRoot, 'dist/config')
const configDependencyFiles = [
  {
    source: join(packageRoot, 'src/utils/brandAssets.ts'),
    output: join(packageRoot, 'dist/utils/brandAssets.mjs'),
  },
]

const relativeImportPattern =
  /(from\s+['"])(\.{1,2}\/[^'"]+)(['"])|(import\s*\(\s*['"])(\.{1,2}\/[^'"]+)(['"]\s*\))/g

const hasExtension = (specifier) => Boolean(extname(specifier))

const withMjsExtensions = (code) =>
  code.replace(
    relativeImportPattern,
    (
      match,
      fromPrefix,
      fromSpecifier,
      fromSuffix,
      dynamicPrefix,
      dynamicSpecifier,
      dynamicSuffix
    ) => {
      if (fromSpecifier) {
        const next = hasExtension(fromSpecifier)
          ? fromSpecifier
          : `${fromSpecifier}.mjs`
        return `${fromPrefix}${next}${fromSuffix}`
      }

      if (dynamicSpecifier) {
        const next = hasExtension(dynamicSpecifier)
          ? dynamicSpecifier
          : `${dynamicSpecifier}.mjs`
        return `${dynamicPrefix}${next}${dynamicSuffix}`
      }

      return match
    }
  )

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = join(dir, entry.name)
      return entry.isDirectory() ? listFiles(entryPath) : entryPath
    })
  )

  return files.flat()
}

await rm(outputRoot, { recursive: true, force: true })

const files = (await listFiles(sourceRoot)).filter((file) => file.endsWith('.ts'))

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      sourceMap: false,
    },
    fileName: file,
  })

  const rel = relative(sourceRoot, file).replace(/\.ts$/, '.mjs')
  const outputPath = join(outputRoot, rel)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, withMjsExtensions(output.outputText), 'utf8')
}

for (const file of configDependencyFiles) {
  const source = await readFile(file.source, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      sourceMap: false,
    },
    fileName: file.source,
  })

  await mkdir(dirname(file.output), { recursive: true })
  await writeFile(file.output, withMjsExtensions(output.outputText), 'utf8')
}

console.log(
  `[fireux-core] built config helpers: ${files.length} file(s), ${configDependencyFiles.length} dependency file(s)`
)
