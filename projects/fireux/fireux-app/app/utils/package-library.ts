import manifest from '../../package.json'
import package0 from 'fireux-ai/package.json'
import package1 from 'fireux-blogs/package.json'
import package2 from 'fireux-core/package.json'
import package3 from 'fireux-docs/package.json'
import package4 from 'fireux-fireux/package.json'
import package5 from 'fireux-ignite/package.json'
import package6 from 'fireux-misebox/package.json'
import package7 from 'fireux-products/package.json'

const packageMetadata: Record<string, { name: string; description?: string }> = {
  'fireux-ai': package0,
  'fireux-blogs': package1,
  'fireux-core': package2,
  'fireux-docs': package3,
  'fireux-fireux': package4,
  'fireux-ignite': package5,
  'fireux-misebox': package6,
  'fireux-products': package7,
}

export const appPackages = Object.keys(manifest.dependencies)
  .filter((name) => name.startsWith('fireux-'))
  .sort()
  .map((name) => ({ name, description: packageMetadata[name]?.description }))
