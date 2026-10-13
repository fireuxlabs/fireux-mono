import manifest from '../../package.json'
import package0 from 'fireux-ai/package.json'
import package1 from 'fireux-blogs/package.json'
import package2 from 'fireux-companies/package.json'
import package3 from 'fireux-core/package.json'
import package4 from 'fireux-demo/package.json'
import package5 from 'fireux-go-qr/package.json'
import package6 from 'fireux-jobs/package.json'
import package7 from 'fireux-kitchens/package.json'
import package8 from 'fireux-misebox/package.json'
import package9 from 'fireux-places/package.json'
import package10 from 'fireux-sproochli/package.json'
import package11 from 'fireux-suppliers/package.json'

const packageMetadata: Record<string, { name: string; description?: string }> = {
  'fireux-ai': package0,
  'fireux-blogs': package1,
  'fireux-companies': package2,
  'fireux-core': package3,
  'fireux-demo': package4,
  'fireux-go-qr': package5,
  'fireux-jobs': package6,
  'fireux-kitchens': package7,
  'fireux-misebox': package8,
  'fireux-places': package9,
  'fireux-sproochli': package10,
  'fireux-suppliers': package11,
}

export const appPackages = Object.keys(manifest.dependencies)
  .filter((name) => name.startsWith('fireux-'))
  .sort()
  .map((name) => ({ name, description: packageMetadata[name]?.description }))
