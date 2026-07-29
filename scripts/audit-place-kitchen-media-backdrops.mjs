#!/usr/bin/env node
// @fireux-script
// Read-only audit. This script never writes Firestore or Storage.

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'node:fs'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem || 'misebox').trim()
const databaseId = String(args.database || 'misebox').trim()
const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: target.projectId,
})
const app = initializeApp({
  credential: auth.credential,
  projectId: target.projectId || auth.projectId,
})
const db = getFirestore(app, databaseId)
const hex = value => /^#[0-9a-f]{6}$/i.test(String(value || '').trim())
const text = value => String(value || '').trim()
const record = value =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const auditConfig = JSON.parse(readFileSync(
  new URL('./data/misebox-media-backdrop-audit.json', import.meta.url),
  'utf8'
))
const annotations = record(auditConfig.asset_annotations)
const legacySuggestion = value => {
  const shade = text(value).toLowerCase()
  if (shade === 'light') return { hex: '#111827', basis: 'legacy light-logo backing' }
  if (shade === 'dark') return { hex: '#ffffff', basis: 'legacy dark-logo backing' }
  return null
}
const paletteSuggestion = value => {
  const palette = record(value)
  for (const key of ['primary_color', 'secondary_color']) {
    if (hex(palette[key])) {
      return { hex: text(palette[key]).toLowerCase(), basis: `Place brand_palette.${key} inference` }
    }
  }
  return null
}

const [placesSnapshot, kitchensSnapshot] = await Promise.all([
  db.collection('places').get(),
  db.collection('kitchens').get(),
])
const places = new Map(placesSnapshot.docs.map(doc => [doc.id, doc.data()]))
const checklist = []

for (const doc of kitchensSnapshot.docs) {
  const kitchen = doc.data()
  const identity = record(kitchen.identity)
  const place = places.get(text(kitchen.place_id)) || {}
  const kitchenColor = text(identity.media_backdrop_color)
  const placeColor = text(place.media_backdrop_color)
  const effectiveColor = hex(kitchenColor)
    ? kitchenColor.toLowerCase()
    : hex(placeColor)
      ? placeColor.toLowerCase()
      : ''
  const assets = [
    ['logo', identity.logo_image_url],
    ['wordmark', identity.wordmark_image_url],
    ['wordmark_no_logo', identity.wordmark_no_logo_image_url],
    ['card override', identity.card_image_url],
  ].filter(([, url]) => text(url))

  if (!assets.length || effectiveColor) continue
  const suggestion =
    legacySuggestion(identity.image_shade) ||
    legacySuggestion(place.image_shade) ||
    paletteSuggestion(place.brand_palette)
  for (const [asset, url] of assets) {
    const annotation = record(annotations[`${doc.id}:${asset}`])
    if (annotation.status === 'no backdrop required') continue
    checklist.push({
      source: 'Live',
      kitchen_id: doc.id,
      kitchen: text(identity.display_name) || doc.id,
      kitchen_slug: text(kitchen.slug),
      place_id: text(kitchen.place_id),
      asset,
      url: text(url),
      status: text(annotation.status) || (suggestion ? 'inferred' : 'eyedropper required'),
      ...(text(annotation.reason)
        ? { reason: text(annotation.reason) }
        : suggestion
          ? { suggested_hex: suggestion.hex, inference: suggestion.basis }
          : {}),
    })
  }
}

console.log(JSON.stringify({
  project_id: target.projectId || auth.projectId,
  database_id: databaseId,
  read_only: true,
  counts: {
    places: placesSnapshot.size,
    kitchens: kitchensSnapshot.size,
    missing_or_deferred_backdrop_assets: checklist.length,
    missing_backdrop_assets: checklist
      .filter(item => item.status !== 'replacement required; backdrop deferred')
      .length,
    deferred_until_replacement_assets: checklist
      .filter(item => item.status === 'replacement required; backdrop deferred')
      .length,
    no_backdrop_required_assets: Object.values(annotations)
      .filter(value => record(value).status === 'no backdrop required')
      .length,
  },
  checklist,
}, null, 2))
