#!/usr/bin/env node
/*
  Firestore migration: restructure La Tapberne menus into channel menus.

  Kitchen scope only:
    kitchens/{kitchenId}/menus/*

  Source docs:
    - menu-main
    - menu-limited

  Target docs:
    - menu-dine-in
    - menu-chef-off
    - menu-delivery
    - menu-collection

  Usage:
    node scripts/migrate-tapberne-channel-menus.mjs --project <projectId>
    node scripts/migrate-tapberne-channel-menus.mjs --project <projectId> --commit

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_KITCHEN_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'

const DOCS = {
  oldMain: 'menu-main',
  oldLimited: 'menu-limited',
  dineIn: 'menu-dine-in',
  chefOff: 'menu-chef-off',
  delivery: 'menu-delivery',
  collection: 'menu-collection',
}

const args = parseArgs(process.argv.slice(2))
const help = Boolean(args.help || args.h)
const projectId = args.project || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
const commit = Boolean(args.commit)
const kitchenId = String(args.kitchen || DEFAULT_KITCHEN_ID).trim()

if (help) {
  console.log('\nFirestore migration: Tapberne channel menus\n')
  console.log('Usage:')
  console.log('  node scripts/migrate-tapberne-channel-menus.mjs --project <projectId>')
  console.log('  node scripts/migrate-tapberne-channel-menus.mjs --project <projectId> --commit')
  console.log('\nOptions:')
  console.log('  --kitchen <id>  kitchen id (default: La Tapberne)')
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

const cloneSections = (sections) =>
  JSON.parse(JSON.stringify(Array.isArray(sections) ? sections : []))

initializeApp({ credential: await resolveCredential(), projectId })
const db = getFirestore()

console.log('[migrate] tapberne-channel-menus start', {
  projectId,
  kitchenId,
  commit,
})

const kitchenRef = db.collection('kitchens').doc(kitchenId)
const kitchenSnap = await kitchenRef.get()
if (!kitchenSnap.exists) {
  console.error('[migrate] missing_kitchen', { kitchenPath: kitchenRef.path })
  process.exit(2)
}

const menusRef = kitchenRef.collection('menus')

const refs = {
  oldMain: menusRef.doc(DOCS.oldMain),
  oldLimited: menusRef.doc(DOCS.oldLimited),
  dineIn: menusRef.doc(DOCS.dineIn),
  chefOff: menusRef.doc(DOCS.chefOff),
  delivery: menusRef.doc(DOCS.delivery),
  collection: menusRef.doc(DOCS.collection),
}

const [
  oldMainSnap,
  oldLimitedSnap,
  dineInSnap,
  chefOffSnap,
  deliverySnap,
  collectionSnap,
] = await db.getAll(
  refs.oldMain,
  refs.oldLimited,
  refs.dineIn,
  refs.chefOff,
  refs.delivery,
  refs.collection
)

const actions = []

const stageSet = (ref, payload, reason) => {
  actions.push({ type: 'set', ref, payload, reason })
}

const stageDelete = (ref, reason) => {
  actions.push({ type: 'delete', ref, reason })
}

// PHASE 1.1: menu-main -> menu-dine-in
if (dineInSnap.exists) {
  if (oldMainSnap.exists) {
    stageDelete(refs.oldMain, 'cleanup_old_menu_main_after_existing_dine_in')
  }
} else if (oldMainSnap.exists) {
  const source = oldMainSnap.data() || {}
  stageSet(
    refs.dineIn,
    {
      ...source,
      id: DOCS.dineIn,
      name: 'La Tapberne — Dine In Menu',
      active: true,
      updated_at: FieldValue.serverTimestamp(),
    },
    'rename_menu_main_to_menu_dine_in'
  )
  stageDelete(refs.oldMain, 'remove_old_menu_main_after_rename')
} else {
  console.log('[warn] missing_source_menu', { id: DOCS.oldMain })
}

// PHASE 1.2: menu-limited -> menu-chef-off
if (chefOffSnap.exists) {
  if (oldLimitedSnap.exists) {
    stageDelete(refs.oldLimited, 'cleanup_old_menu_limited_after_existing_chef_off')
  }
} else if (oldLimitedSnap.exists) {
  const source = oldLimitedSnap.data() || {}
  stageSet(
    refs.chefOff,
    {
      ...source,
      id: DOCS.chefOff,
      name: 'La Tapberne — Chef Off Menu',
      active: false,
      updated_at: FieldValue.serverTimestamp(),
    },
    'rename_menu_limited_to_menu_chef_off'
  )
  stageDelete(refs.oldLimited, 'remove_old_menu_limited_after_rename')
} else {
  console.log('[warn] missing_source_menu', { id: DOCS.oldLimited })
}

const dineInSourceData = dineInSnap.exists
  ? dineInSnap.data() || {}
  : oldMainSnap.exists
    ? oldMainSnap.data() || {}
    : null

// PHASE 2: create menu-delivery (clone sections from dine-in)
if (!deliverySnap.exists) {
  if (!dineInSourceData) {
    console.error('[migrate] missing_dine_in_source_for_delivery')
    process.exit(3)
  }

  stageSet(
    refs.delivery,
    {
      id: DOCS.delivery,
      kitchen_id: kitchenId,
      app_id: 'misebox-app',
      creator_id: '',
      name: 'La Tapberne — Delivery Menu',
      description: 'Delivery optimised menu.',
      active: false,
      sort_order: 3,
      sections: cloneSections(dineInSourceData.sections),
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    },
    'create_menu_delivery_from_dine_in_sections'
  )
}

const deliverySourceData = deliverySnap.exists
  ? deliverySnap.data() || {}
  : {
      sections: cloneSections((dineInSourceData || {}).sections),
    }

// PHASE 3: create menu-collection (clone sections from delivery)
if (!collectionSnap.exists) {
  stageSet(
    refs.collection,
    {
      id: DOCS.collection,
      kitchen_id: kitchenId,
      app_id: 'misebox-app',
      creator_id: '',
      name: 'La Tapberne — Collection Menu',
      description: 'Pickup collection menu.',
      active: false,
      sort_order: 4,
      sections: cloneSections(deliverySourceData.sections),
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    },
    'create_menu_collection_from_delivery_sections'
  )
}

console.log('[migrate] analysis', {
  menus: {
    oldMainExists: oldMainSnap.exists,
    oldLimitedExists: oldLimitedSnap.exists,
    dineInExists: dineInSnap.exists,
    chefOffExists: chefOffSnap.exists,
    deliveryExists: deliverySnap.exists,
    collectionExists: collectionSnap.exists,
  },
  plannedActions: actions.length,
  setActions: actions.filter((entry) => entry.type === 'set').length,
  deleteActions: actions.filter((entry) => entry.type === 'delete').length,
})

for (const action of actions) {
  if (action.type === 'set') {
    const sectionCount = Array.isArray(action.payload?.sections)
      ? action.payload.sections.length
      : 0

    if (!commit) {
      console.log('[dry-run-set]', action.ref.path, {
        reason: action.reason,
        id: action.payload?.id,
        name: action.payload?.name,
        active: action.payload?.active,
        sort_order: action.payload?.sort_order,
        sections: sectionCount,
      })
      continue
    }

    await action.ref.set(action.payload, { merge: false })
    console.log('[set]', action.ref.path, {
      reason: action.reason,
      id: action.payload?.id,
      name: action.payload?.name,
      sections: sectionCount,
    })
    continue
  }

  if (action.type === 'delete') {
    if (!commit) {
      console.log('[dry-run-delete]', action.ref.path, { reason: action.reason })
      continue
    }

    await action.ref.delete()
    console.log('[delete]', action.ref.path, { reason: action.reason })
  }
}

console.log('[migrate] tapberne-channel-menus done', {
  commit,
  kitchenPath: kitchenRef.path,
  plannedActions: actions.length,
})
