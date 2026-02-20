#!/usr/bin/env node
/*
  Firestore migration: seed La Tapberne menus.

  Writes ONLY:
    kitchens/{kitchenId}/menus/{menuId}

  Default kitchen is La Tapberne:
    ChIJ08WSgYSjj0cRD6oE3RwUFk0

  Usage:
    node scripts/migrate-tapberne-menus.mjs --project <projectId> [--commit]
    node scripts/migrate-tapberne-menus.mjs --project <projectId> --kitchen <kitchenId> [--commit]

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_KITCHEN_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0' // La Tapberne

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)
const force = Boolean(args.force)
const kitchenId = String(args.kitchen || DEFAULT_KITCHEN_ID).trim()
const appId = String(args['app-id'] || args.appId || 'misebox-app').trim()
const creatorId = String(args['creator-id'] || args.creatorId || '').trim()

if (help) {
  console.log('\nFirestore migration: seed La Tapberne menus\n')
  console.log('Usage:')
  console.log('  node scripts/migrate-tapberne-menus.mjs --project <projectId> [--commit]')
  console.log('  node scripts/migrate-tapberne-menus.mjs --project <projectId> --kitchen <kitchenId> [--commit]')
  console.log('\nOptions:')
  console.log('  --app-id <id>       app_id value (default: misebox-app)')
  console.log('  --creator-id <uid>  creator_id value (default: empty)')
  console.log('  --force             allow commit even if other menu IDs already exist')
  console.log('\nAuth (one required):')
  console.log('  - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)')
  console.log('  - FIREBASE_SERVICE_ACCOUNT (JSON string)')
  console.log('  - Or Google ADC (gcloud): application-default login')
  process.exit(0)
}

if (!projectId) {
  console.error('Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(1)
}

if (!kitchenId) {
  console.error('Missing --kitchen (or default kitchen id).')
  process.exit(1)
}

async function resolveCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    return cert(json)
  }

  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    const raw = await readFile(saPath, 'utf8')
    return cert(JSON.parse(raw))
  }

  return applicationDefault()
}

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/g, '')
    .replace(/-+$/g, '')

const item = (label, priceMinor, sortOrder) => ({
  id: `item-${slugify(label) || `n-${sortOrder}`}`,
  dish_id: '',
  label,
  price_minor: Number(priceMinor || 0),
  sort_order: sortOrder,
})

const section = (label, entries, sortOrder) => ({
  id: `section-${slugify(label) || `n-${sortOrder}`}`,
  label,
  description: '',
  sort_order: sortOrder,
  items: entries.map((entry, index) => item(entry.label, entry.price_minor, index + 1)),
})

const mainMenu = {
  id: 'menu-main',
  kitchen_id: kitchenId,
  name: 'La Tapberne — Main Menu',
  description: 'Seeded from paper menu photos (v0).',
  active: true,
  currency_code: 'CHF',
  sort_order: 1,
  sections: [
    section('Tapas', [
      { label: 'Patatas · Aioli', price_minor: 950 },
      { label: 'Patatas · Bravas', price_minor: 950 },
      { label: 'Tortilla de Patata', price_minor: 950 },
      { label: 'Gebratene Pimientos de Padrón', price_minor: 950 },
      { label: 'Portobello Ajillo', price_minor: 900 },
      { label: 'Panierte Camembert', price_minor: 1600 },
      { label: 'Buffalo-Schwein Ribs', price_minor: 1600 },
      { label: 'The famous Schweinbauch Albarino Teriyaki', price_minor: 2100 },
      { label: 'Crispy Chicken Fingers', price_minor: 2500 },
    ], 1),
    section('Bisschen Meer', [
      { label: 'Tabla Ibérica', price_minor: 2500 },
      { label: 'Black Tiger al Ajillo', price_minor: 1800 },
      { label: 'Calamares Knusperli', price_minor: 1800 },
      { label: 'Pulpo a la Gallega', price_minor: 2500 },
      { label: 'Grillierter Pulpo', price_minor: 2500 },
      { label: 'Jamón', price_minor: 1000 },
      { label: 'Kroketten Trüffel', price_minor: 1000 },
      { label: 'Gemischter Salat', price_minor: 1000 },
      { label: 'Bloody Mary Burrata', price_minor: 1900 },
    ], 2),
    section('Hauptgerichte', [
      { label: 'Tapberne Nüssler Salat', price_minor: 2100 },
      { label: 'Caesar Salat', price_minor: 2100 },
      { label: 'Schwein/Poulet', price_minor: 2700 },
      { label: 'Spiegelei(er)', price_minor: 250 },
      { label: 'Huevos Rotos con Cecina', price_minor: 2400 },
      { label: 'Fish and Chips', price_minor: 0 },
    ], 3),
    section('Oléhands', [
      { label: 'Sicanha Smashburger', price_minor: 0 },
      { label: 'The Vegi Smashburger', price_minor: 2500 },
      { label: 'La Tapberne Francesinha', price_minor: 0 },
      { label: 'Hot Dog', price_minor: 0 },
      { label: 'Hot Dog Vegi', price_minor: 1800 },
      { label: 'Egli Sandwich', price_minor: 1800 },
      { label: 'Serrano Sandwich', price_minor: 1600 },
    ], 4),
    section("Opi’s süssi", [
      { label: 'Churro Bites', price_minor: 0 },
      { label: 'Cheesecake', price_minor: 1000 },
      { label: 'Happy Tarta de Santiago', price_minor: 1000 },
    ], 5),
  ],
  app_id: appId,
  creator_id: creatorId,
}

const limitedMenu = {
  id: 'menu-limited',
  kitchen_id: kitchenId,
  name: 'La Tapberne — Limited Menu',
  description: 'Reduced menu when chef is off.',
  active: false,
  currency_code: 'CHF',
  sort_order: 2,
  sections: [
    section('Tapas', [
      { label: 'Patatas · Aioli', price_minor: 950 },
      { label: 'Patatas · Bravas', price_minor: 950 },
    ], 1),
    section('Oléhands', [
      { label: 'The Vegi Smashburger', price_minor: 2500 },
      { label: 'Hot Dog Vegi', price_minor: 1800 },
      { label: 'Serrano Sandwich', price_minor: 1600 },
    ], 2),
    section("Opi’s süssi", [
      { label: 'Cheesecake', price_minor: 1000 },
      { label: 'Happy Tarta de Santiago', price_minor: 1000 },
    ], 3),
  ],
  app_id: appId,
  creator_id: creatorId,
}

initializeApp({ credential: await resolveCredential(), projectId })
const db = getFirestore()

console.log('[migrate] tapberne-menus start', {
  projectId,
  kitchenId,
  appId,
  force,
  commit,
})

const kitchenRef = db.collection('kitchens').doc(kitchenId)
const kitchenSnap = await kitchenRef.get()
if (!kitchenSnap.exists) {
  console.error('[migrate] tapberne-menus missing_kitchen', { kitchenPath: kitchenRef.path })
  process.exit(2)
}

const menus = [mainMenu, limitedMenu]
const obsoleteMenuIds = ['menu-drinks-specials']
const targetMenuIds = new Set(menus.map((menu) => String(menu.id || '').trim()).filter(Boolean))

const existingMenusSnap = await kitchenRef.collection('menus').select().get()
const existingMenuIds = existingMenusSnap.docs.map((docSnap) => String(docSnap.id || '').trim())
const conflictingMenuIds = existingMenuIds.filter((menuId) => menuId && !targetMenuIds.has(menuId))

if (commit && conflictingMenuIds.length && !force) {
  console.error('[migrate] refusing_commit_due_existing_non_target_menus', {
    kitchenPath: kitchenRef.path,
    targetMenuIds: [...targetMenuIds],
    conflictingMenuIds,
    hint: 'Re-run with --force if you intentionally want to keep mixed menu IDs.',
  })
  process.exit(3)
}

for (const menu of menus) {
  const menuRef = kitchenRef.collection('menus').doc(menu.id)
  const existing = await menuRef.get()

  const payload = {
    ...menu,
    id: menu.id,
    kitchen_id: kitchenId,
    updated_at: FieldValue.serverTimestamp(),
    ...(existing.exists ? {} : { created_at: FieldValue.serverTimestamp() }),
  }

  if (!commit) {
    console.log('[dry-run]', menuRef.path, {
      name: payload.name,
      sections: Array.isArray(payload.sections) ? payload.sections.length : 0,
      created: !existing.exists,
      updated: true,
    })
    continue
  }

  await menuRef.set(payload, { merge: true })

  console.log('[write]', menuRef.path, {
    name: payload.name,
    sections: Array.isArray(payload.sections) ? payload.sections.length : 0,
    created: !existing.exists,
    updated: true,
  })
}

for (const obsoleteMenuId of obsoleteMenuIds) {
  const obsoleteRef = kitchenRef.collection('menus').doc(obsoleteMenuId)
  const obsoleteSnap = await obsoleteRef.get()
  if (!obsoleteSnap.exists) continue

  if (!commit) {
    console.log('[dry-run-delete]', obsoleteRef.path)
    continue
  }

  await obsoleteRef.delete()
  console.log('[delete]', obsoleteRef.path)
}

console.log('[migrate] tapberne-menus done', {
  commit,
  kitchenPath: kitchenRef.path,
  menusWritten: menus.length,
})
