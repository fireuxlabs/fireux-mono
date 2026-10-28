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
if (
  (input.files && !isDeepStrictEqual(input.files, artifact.files)) ||
  (input.assets && !isDeepStrictEqual(input.assets, artifact.assets))
)
  throw new Error(
    'Prepared source changed. Prepare the reviewed brief again before writing files.'
  )
if (option === '--write') {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
  const destination = resolve(root, artifact.sourcePath)
  // A repeat resumes an identical output; it never overwrites development work.
  let created = false
  try {
    await mkdir(destination)
    created = true
  } catch (error) {
    if (error.code !== 'EEXIST') throw error
  }
  if (!created) {
    for (const [path, source] of Object.entries(artifact.files))
      if ((await readFile(resolve(destination, path), 'utf8')) !== source)
        throw new Error(
          'Existing App source differs. Inspect it before continuing; nothing was overwritten.'
        )
    const assets = resolve(root, artifact.assets.source)
    for (const path of await readdir(assets, { recursive: true }))
      if (
        (await stat(resolve(assets, path))).isFile() &&
        !(await readFile(resolve(assets, path))).equals(
          await readFile(
            resolve(destination, artifact.assets.destination, path)
          )
        )
      )
        throw new Error(
          'Existing App artwork differs. Inspect it before continuing; nothing was overwritten.'
        )
  } else
    try {
      for (const [path, source] of Object.entries(artifact.files)) {
        await mkdir(dirname(resolve(destination, path)), { recursive: true })
        await writeFile(resolve(destination, path), source, { flag: 'wx' })
      }
      await cp(
        resolve(root, artifact.assets.source),
        resolve(destination, artifact.assets.destination),
        { recursive: true, force: false, errorOnExist: true }
      )
    } catch (error) {
      await rm(destination, { recursive: true, force: true })
      throw error
    }
}
console.log(JSON.stringify(artifact, null, 2))
