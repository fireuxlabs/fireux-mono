/**
 * Immutable delivery contract for the read-only Misebox Demo World.
 *
 * This is a URL contract only. Fixture modules do not import Firebase or read
 * Storage at runtime. FireUX Core deliberately knows nothing about Misebox.
 */
export const miseboxDemoMediaContract = {
  projectId: 'misebox-78f9c',
  storageBucket: 'misebox-78f9c.appspot.com',
  objectPrefix: 'demo/misebox-app',
  downloadToken: 'f71ae1d8-4b0e-4d0c-8b65-cc99580a6c60',
} as const

const demoMediaRelativePath = (value: string) => {
  const path = String(value || '')
    .trim()
    .replace(/^\/+/, '')
  if (
    !path ||
    path.includes('..') ||
    path.includes('\\') ||
    path.includes('//') ||
    path.includes('?') ||
    path.includes('#') ||
    !/^[a-z0-9][a-z0-9./-]*[a-z0-9]$/.test(path)
  ) {
    throw new Error(`Invalid Misebox Demo media path: ${value || '(empty)'}`)
  }
  return path
}

export const miseboxDemoMediaObjectPath = (relativePath: string) =>
  `${miseboxDemoMediaContract.objectPrefix}/${demoMediaRelativePath(relativePath)}`

export const miseboxDemoMediaUrl = (relativePath: string) => {
  const objectPath = miseboxDemoMediaObjectPath(relativePath)
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
    miseboxDemoMediaContract.storageBucket
  )}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(
    miseboxDemoMediaContract.downloadToken
  )}`
}
