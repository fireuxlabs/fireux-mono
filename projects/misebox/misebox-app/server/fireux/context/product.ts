import { createHash } from 'node:crypto'

// Intentionally public App literature. Internal context remains a separate record.
const context = {
  title: 'About Misebox',
  summary:
    'Misebox helps people organise and operate kitchens. Its audience includes kitchen owners, managers and staff. A Kitchen is an operational workspace. Team means the people associated with a Kitchen. A job title describes work responsibility; an access role determines permissions. A person may work across multiple kitchens. AI prepares the same actions available through human controls. Product context provides public background; current kitchen records and available tools must be read separately.',
  source: 'Misebox App published product description.',
  reviewStatus: 'reviewed' as const,
}
const identity = {
  name: 'Misebox',
  description: 'Misebox helps people organise and operate kitchens.',
  imageUrl: 'https://misebox.app/img/app/logo.png',
  url: 'https://misebox.app',
}

export function readFireuxProductContext() {
  return {
    schemaVersion: 1,
    visibility: 'public',
    appId: 'misebox-app',
    contextId: 'product',
    sourcePath: '/api/fireux/context/product',
    revision: createHash('sha256')
      .update(JSON.stringify({ context, identity }))
      .digest('hex'),
    context: { ...context },
    identity: { ...identity },
  }
}
