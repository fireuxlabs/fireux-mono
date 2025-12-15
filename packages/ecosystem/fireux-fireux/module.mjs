import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, { interopDefault: true })

const loaded = await jiti.import('./src/module.ts')

export default loaded?.default ?? loaded
