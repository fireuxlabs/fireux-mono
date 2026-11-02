import {
  readFile,
  mkdir,
  writeFile,
  rm,
  cp,
  readdir,
  stat,
} from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import { prepareIgnitionPreview } from '../shared/ignition-preview.ts'

const [inputPath, option] = process.argv.slice(2)
if (!inputPath || (option && option !== '--write'))
  throw new Error(
    'Use: node --experimental-strip-types ignition/prepare.mjs <brief.json> [--write]'
  )
const input = JSON.parse(await readFile(inputPath, 'utf8'))
const artifact = prepareIgnitionPreview(input.input ?? input)
for (const key of ['files', 'assets', 'ecosystem'])
  if (input[key] && !isDeepStrictEqual(input[key], artifact[key]))
    throw new Error(
      'Prepared source changed. Prepare the reviewed brief again before writing files.'
    )

if (option === '--write') {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
  const outputs = [artifact.ecosystem, artifact]
  const created = []
  // Check both owners before creating either. Never overwrite operator development.
  for (const output of outputs) {
    const destination = resolve(root, output.sourcePath)
    let exists = false
    try {
      await stat(destination)
      exists = true
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    if (exists) {
      for (const [path, source] of Object.entries(output.files))
        if ((await readFile(resolve(destination, path), 'utf8')) !== source)
          throw new Error('Existing source differs; nothing was overwritten.')
      if (output.assets) {
        const assets = resolve(root, output.assets.source)
        for (const path of await readdir(assets, { recursive: true }))
          if (
            (await stat(resolve(assets, path))).isFile() &&
            !(await readFile(resolve(assets, path))).equals(
              await readFile(
                resolve(destination, output.assets.destination, path)
              )
            )
          )
            throw new Error(
              'Existing artwork differs; nothing was overwritten.'
            )
      }
    }
    output.exists = exists
  }
  try {
    for (const output of outputs) {
      if (output.exists) continue
      const destination = resolve(root, output.sourcePath)
      await mkdir(dirname(destination), { recursive: true })
      await mkdir(destination)
      created.push(destination)
      for (const [path, source] of Object.entries(output.files)) {
        await mkdir(dirname(resolve(destination, path)), { recursive: true })
        await writeFile(resolve(destination, path), source, { flag: 'wx' })
      }
      if (output.assets)
        await cp(
          resolve(root, output.assets.source),
          resolve(destination, output.assets.destination),
          { recursive: true, force: false, errorOnExist: true }
        )
    }
  } catch (error) {
    for (const destination of created.reverse())
      await rm(destination, { recursive: true, force: true })
    throw error
  }
  for (const output of outputs) delete output.exists
}
console.log(JSON.stringify(artifact, null, 2))
