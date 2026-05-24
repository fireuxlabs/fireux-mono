import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import type { Firestore } from 'firebase-admin/firestore'
import { getFirestoreDb } from '../../firebase-admin'

type RegistryDocument = Record<string, unknown> & { id?: string }

type DirectoryApp = {
  key: string
  id: string
  name: string
  ecosystem: string
  role: string
  src: string
  text: string
  href: string
}

type DirectoryEcosystem = {
  key: string
  id: string
  name: string
  src: string
  text: string
  href: string
}

type DirectoryError = {
  collection: string
  message: string
}

function initials(name: string) {
  return name
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asNumber(value: unknown) {
  const next = Number(value)
  return Number.isFinite(next) ? next : 0
}

function asObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((entry) => asString(entry)).filter(Boolean)
    : []
}

async function fetchCollection(db: Firestore, collectionPath: string) {
  const snapshot = await db.collection(collectionPath).get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

function appLaunchOrder(app: RegistryDocument) {
  return asNumber(asObject(app.fireux_repo).launch_order)
}

function toDirectoryApp(raw: RegistryDocument): DirectoryApp | null {
  const id = asString(raw.id)
  const name = asString(raw.app_name) || asString(raw.name) || id
  const ecosystem = asString(raw.ecosystem_id) || asString(raw.ecosystem)
  const role = asString(raw.role)
  const media = asObject(raw.media)
  const socialLinks = asObject(raw.social_links)
  const logoUrl = asString(media.logo_url) || asString(media.thumbnail_url)
  const href = asString(socialLinks.website)

  if (!id || !name || !ecosystem || !role) return null

  return {
    key: id,
    id,
    name,
    ecosystem,
    role,
    src: logoUrl,
    text: initials(name),
    href,
  }
}

function toDirectoryEcosystem(raw: RegistryDocument): DirectoryEcosystem | null {
  const id = asString(raw.id)
  const name = asString(raw.name) || id
  const imageUrl = asString(raw.image_url)
  const sourceUrl = asString(raw.source_url)

  if (!id || !name) return null

  return {
    key: id,
    id,
    name,
    src: imageUrl,
    text: initials(name),
    href: sourceUrl || '/ecosystems',
  }
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  const errors: DirectoryError[] = []

  try {
    const db = await getFirestoreDb()
    const [rawApps, rawEcosystems] = await Promise.all([
      fetchCollection(db, 'apps').catch((error) => {
        errors.push({
          collection: 'apps',
          message: error instanceof Error ? error.message : 'Unable to read apps',
        })
        return [] as RegistryDocument[]
      }),
      fetchCollection(db, 'ecosystems').catch((error) => {
        errors.push({
          collection: 'ecosystems',
          message:
            error instanceof Error ? error.message : 'Unable to read ecosystems',
        })
        return [] as RegistryDocument[]
      }),
    ])

    const apps = rawApps
      .map(toDirectoryApp)
      .filter((row): row is DirectoryApp => Boolean(row))
      .sort((a, b) => {
        const sourceA = rawApps.find((entry) => asString(entry.id) === a.id)
        const sourceB = rawApps.find((entry) => asString(entry.id) === b.id)
        const orderA = sourceA ? appLaunchOrder(sourceA) : 0
        const orderB = sourceB ? appLaunchOrder(sourceB) : 0
        if (orderA !== orderB) return orderA - orderB
        return a.name.localeCompare(b.name)
      })

    const ecosystems = rawEcosystems
      .map((entry) => ({
        ...entry,
        appCount: asStringArray(entry.apps).length,
      }))
      .map(toDirectoryEcosystem)
      .filter((row): row is DirectoryEcosystem => Boolean(row))
      .sort((a, b) => a.name.localeCompare(b.name))

    return {
      ecosystems,
      apps,
      errors,
    }
  } catch (error) {
    errors.push({
      collection: 'landing-directory',
      message:
        error instanceof Error ? error.message : 'Unable to read landing directory',
    })

    return {
      ecosystems: [],
      apps: [],
      errors,
    }
  }
})
