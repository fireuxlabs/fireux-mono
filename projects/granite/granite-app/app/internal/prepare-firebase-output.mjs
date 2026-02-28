import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputPackageJson = join(process.cwd(), '.output/server/package.json')
const packageJson = JSON.parse(readFileSync(outputPackageJson, 'utf8'))

packageJson.dependencies ||= {}
packageJson.dependencies['@google-cloud/functions-framework'] ||= '^3.5.1'

writeFileSync(outputPackageJson, `${JSON.stringify(packageJson, null, 2)}\n`)
