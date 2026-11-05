import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ts from 'typescript'

// Bundle configuration is delivered as ESM; runtime sources stay with Nuxt.
const source = resolve('src')
const output = resolve('dist')
await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
for (const file of await readdir(source)) {
  if (!file.endsWith('.ts') || file.endsWith('.d.ts')) continue
  const result = ts.transpileModule(
    await readFile(resolve(source, file), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: file,
    }
  )
  const code = result.outputText.replace(
    /from (['"])(\.\.?\/[^'"]+)\1/g,
    (match, quote, path) =>
      /\.[a-z]+$/i.test(path) ? match : `from ${quote}${path}.mjs${quote}`
  )
  await writeFile(resolve(output, file.replace(/\.ts$/, '.mjs')), code)
}
