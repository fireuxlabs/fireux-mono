import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import { prepareIgnitionPreview } from '../shared/ignition-preview.ts'
import { deliverIgnition, parseWorkerOptions } from './delivery.mjs'

const [inputPath, ...args] = process.argv.slice(2)
if (!inputPath) throw new Error('Supply a reviewed Ignition brief JSON file.')
const write = args.includes('--write')
const options = parseWorkerOptions(
  args.filter((arg) => arg !== '--write'),
  { required: write }
)
const input = JSON.parse(await readFile(inputPath, 'utf8'))
const artifact = prepareIgnitionPreview(input.input ?? input)
for (const key of ['files', 'assets', 'ecosystem', 'codexTask'])
  if (input[key] && !isDeepStrictEqual(input[key], artifact[key]))
    throw new Error(
      'Prepared source changed. Prepare the reviewed brief again before writing files.'
    )
const result = write
  ? await deliverIgnition({
      ...options,
      root: resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'),
      input: artifact.input,
    })
  : artifact
if (write && result.state !== 'ready') process.exitCode = 1
console.log(JSON.stringify(result, null, 2))
