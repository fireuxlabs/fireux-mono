#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const STORAGE_BUCKET = 'misebox-78f9c.appspot.com'
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const APP_ID = 'la-tap-berne'
const KITCHEN_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const MENU_ID = 'main'
const LEGACY_MENU_ID = 'default'
const SOURCE_UPLOAD_ID = 'main-copy'
const TARGET_UPLOAD_ID = 'main'
const RUNS_DIR = 'temp/menu-extraction-runs'
const ACTOR = 'workspace:migrate-la-tapberne-main-from-main-copy'

const args = new Set(process.argv.slice(2))
const commit = args.has('--commit')
const deleteStaleDishes = args.has('--delete-stale-dishes')
const cleanupMainCopy = args.has('--cleanup-main-copy')
const cleanupDefaultMenu = args.has('--cleanup-default-menu')
const forceDefaultMenuDelete = args.has('--force-default-menu-delete')

const clean = (value) => String(value ?? '').trim()
const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

function slugify(value, fallback) {
  const slug = clean(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

function uniqueId(base, used) {
  const root = slugify(base, 'item')
  let id = root
  let index = 2

  while (used.has(id)) {
    id = `${root}-${index}`
    index += 1
  }

  used.add(id)
  return id
}

function number(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function normalizePriceOptions(value) {
  if (!Array.isArray(value)) return []

  return value
    .map((option) => {
      const data = record(option)
      return {
        label: clean(data.label),
        price: number(data.price),
      }
    })
    .filter((option) => option.price > 0)
}

async function latestRunPath() {
  const entries = await readdir(RUNS_DIR)
  const runs = entries
    .filter((entry) => entry.startsWith(`${SOURCE_UPLOAD_ID}-`) && entry.endsWith('.json'))
    .sort()

  if (!runs.length) {
    throw new Error(`No ${SOURCE_UPLOAD_ID} extraction runs found in ${RUNS_DIR}`)
  }

  return join(RUNS_DIR, runs.at(-1))
}

function extractedSections(run) {
  const normalized = record(run.normalized)
  const sections = Array.isArray(normalized.sections) ? normalized.sections : []

  if (!sections.length) {
    throw new Error('Latest extraction has no normalized sections to migrate.')
  }

  return sections
}

function buildStructure(sections) {
  const dishIds = new Set()
  const sectionIds = new Set()

  return sections.map((section, sectionIndex) => {
    const sectionId = uniqueId(clean(section.label), sectionIds)
    const items = Array.isArray(section.items) ? section.items : []

    return {
      id: sectionId,
      label: clean(section.label) || `Section ${sectionIndex + 1}`,
      sort_order: sectionIndex + 1,
      items: items.map((item, itemIndex) => {
        const name = clean(item.name) || `Item ${itemIndex + 1}`
        const dishId = uniqueId(name, dishIds)

        return {
          id: `${sectionId}-${String(itemIndex + 1).padStart(2, '0')}`,
          dish_id: dishId,
          dish: {
            id: dishId,
            name,
            slug: dishId,
            description: clean(item.description),
          },
          price: number(item.price),
          price_options: normalizePriceOptions(item.price_options),
          source_file_ids: Array.isArray(item.source_file_ids)
            ? item.source_file_ids.map(clean).filter(Boolean)
            : [],
          sort_order: itemIndex + 1,
        }
      }),
    }
  })
}

async function listCollectionRefs(collectionRef) {
  const snap = await collectionRef.get()
  return snap.docs.map((doc) => doc.ref)
}

async function collectDocumentTreeRefs(docRef) {
  const refs = []
  const collections = await docRef.listCollections()

  for (const collectionRef of collections) {
    const snap = await collectionRef.get()
    for (const childDoc of snap.docs) {
      refs.push(...await collectDocumentTreeRefs(childDoc.ref))
      refs.push(childDoc.ref)
    }
  }

  return refs
}

async function deleteRefs(refs) {
  if (!commit || !refs.length) return

  for (let index = 0; index < refs.length; index += 400) {
    const batch = refs[0].firestore.batch()
    refs.slice(index, index + 400).forEach((ref) => batch.delete(ref))
    await batch.commit()
  }
}

async function deleteMenuSections(batch, menuRef) {
  const sectionRefs = await listCollectionRefs(menuRef.collection('sections'))
  let deletedItems = 0

  for (const sectionRef of sectionRefs) {
    const itemRefs = await listCollectionRefs(sectionRef.collection('items'))
    itemRefs.forEach((itemRef) => batch.delete(itemRef))
    batch.delete(sectionRef)
    deletedItems += itemRefs.length
  }

  return {
    sections: sectionRefs.length,
    items: deletedItems,
  }
}

function stamp(appId = APP_ID) {
  return {
    at: FieldValue.serverTimestamp(),
    by: ACTOR,
    app_id: appId,
  }
}

function fileUrl(bucketName, objectPath, token) {
  if (!objectPath || !token) return ''

  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`
}

async function downloadUrlForFile(file) {
  const [metadata] = await file.getMetadata()
  const token = clean(metadata?.metadata?.firebaseStorageDownloadTokens)
    .split(',')
    .map(clean)
    .find(Boolean)

  return fileUrl(file.bucket.name, file.name, token)
}

function restampUpload(upload, copiedFiles) {
  const files = Array.isArray(upload.files) ? upload.files : []
  const primaryCopiedFile = copiedFiles[0]

  return {
    ...upload,
    id: TARGET_UPLOAD_ID,
    status: 'uploaded',
    storage_path: primaryCopiedFile?.storagePath || clean(upload.storage_path),
    file_url: primaryCopiedFile?.fileUrl || clean(upload.file_url),
    files: files.map((file, index) => ({
      ...record(file),
      file_url: copiedFiles[index]?.fileUrl || clean(record(file).file_url),
      storage_path: copiedFiles[index]?.storagePath || clean(record(file).storage_path),
      sort_order: index,
    })),
    files_count: files.length || Number(upload.files_count || 0),
    source_upload_id: SOURCE_UPLOAD_ID,
    migrated_from: SOURCE_UPLOAD_ID,
    updated: stamp(),
  }
}

async function copySourceFiles(bucket, sourceUpload) {
  const files = Array.isArray(sourceUpload.files) ? sourceUpload.files : []
  const copiedFiles = []

  for (const file of files) {
    const data = record(file)
    const sourcePath = clean(data.storage_path)
    const name = sourcePath.split('/').pop()
    const targetPath = sourcePath && name
      ? sourcePath.replace(
          `/menu-uploads/${SOURCE_UPLOAD_ID}/source/`,
          `/menu-uploads/${TARGET_UPLOAD_ID}/source/`
        )
      : ''

    if (!sourcePath || !targetPath) continue

    let targetFileUrl = clean(data.file_url)
    if (commit) {
      const targetFile = bucket.file(targetPath)
      await bucket.file(sourcePath).copy(targetFile)
      targetFileUrl = await downloadUrlForFile(targetFile)
      if (!targetFileUrl) {
        throw new Error(`Copied storage file has no download token: ${targetPath}`)
      }
    }

    copiedFiles.push({
      sourcePath,
      storagePath: targetPath,
      fileUrl: targetFileUrl,
    })
  }

  return copiedFiles
}

async function deleteSourceUpload(db, bucket, basePath, sourceUpload) {
  const paths = new Set()
  const sourceStoragePath = clean(sourceUpload.storage_path)
  if (sourceStoragePath) paths.add(sourceStoragePath)

  if (Array.isArray(sourceUpload.files)) {
    for (const file of sourceUpload.files) {
      const path = clean(record(file).storage_path)
      if (path) paths.add(path)
    }
  }

  if (commit) {
    for (const path of paths) {
      await bucket.file(path).delete({ ignoreNotFound: true })
    }

    await db.doc(`${basePath}/menu-uploads/${SOURCE_UPLOAD_ID}`).delete()
  }

  return Array.from(paths)
}

function uploadFileCount(upload) {
  const count = Number(upload.files_count || 0)
  if (Number.isFinite(count) && count > 0) return count
  return Array.isArray(upload.files) ? upload.files.length : 0
}

async function cleanupSourceUploadOnly({ db, bucket, basePath }) {
  const sourceUploadRef = db.doc(`${basePath}/menu-uploads/${SOURCE_UPLOAD_ID}`)
  const targetUploadRef = db.doc(`${basePath}/menu-uploads/${TARGET_UPLOAD_ID}`)
  const [sourceUploadSnap, targetUploadSnap] = await Promise.all([
    sourceUploadRef.get(),
    targetUploadRef.get(),
  ])

  if (!targetUploadSnap.exists) {
    throw new Error(`Refusing cleanup because ${targetUploadRef.path} does not exist.`)
  }

  const targetUpload = targetUploadSnap.data() || {}
  const targetFileCount = uploadFileCount(targetUpload)
  if (targetFileCount < 1) {
    throw new Error(`Refusing cleanup because ${targetUploadRef.path} has no files.`)
  }

  const sourceUpload = sourceUploadSnap.exists ? sourceUploadSnap.data() || {} : {}
  const deletedSourcePaths = sourceUploadSnap.exists
    ? await deleteSourceUpload(db, bucket, basePath, sourceUpload)
    : []

  console.log(JSON.stringify({
    commit,
    cleanupMainCopy: true,
    appId: APP_ID,
    kitchenId: KITCHEN_ID,
    sourceUploadId: SOURCE_UPLOAD_ID,
    targetUploadId: TARGET_UPLOAD_ID,
    plan: {
      targetUpload: targetUploadRef.path,
      targetFileCount,
      sourceUploadExists: sourceUploadSnap.exists,
      sourceUploadDeleted: sourceUploadRef.path,
      deletedSourcePaths,
    },
  }, null, 2))
}

async function cleanupDefaultMenuOnly({ db, basePath }) {
  const mainMenuRef = db.doc(`${basePath}/menus/${MENU_ID}`)
  const defaultMenuRef = db.doc(`${basePath}/menus/${LEGACY_MENU_ID}`)
  const [mainMenuSnap, defaultMenuSnap] = await Promise.all([
    mainMenuRef.get(),
    defaultMenuRef.get(),
  ])

  if (!mainMenuSnap.exists) {
    throw new Error(`Refusing cleanup because ${mainMenuRef.path} does not exist.`)
  }

  const defaultMenu = defaultMenuSnap.exists ? defaultMenuSnap.data() || {} : {}
  const defaultStatus = clean(defaultMenu.status)
  if (
    defaultMenuSnap.exists &&
    defaultStatus !== 'archived' &&
    !forceDefaultMenuDelete
  ) {
    throw new Error(
      `Refusing cleanup because ${defaultMenuRef.path} is not archived. ` +
      'Pass --force-default-menu-delete if you really want to delete it.'
    )
  }

  const childRefs = defaultMenuSnap.exists
    ? await collectDocumentTreeRefs(defaultMenuRef)
    : []
  const refsToDelete = defaultMenuSnap.exists
    ? [...childRefs, defaultMenuRef]
    : []

  await deleteRefs(refsToDelete)

  console.log(JSON.stringify({
    commit,
    cleanupDefaultMenu: true,
    appId: APP_ID,
    kitchenId: KITCHEN_ID,
    menuId: MENU_ID,
    legacyMenuId: LEGACY_MENU_ID,
    plan: {
      mainMenu: mainMenuRef.path,
      legacyMenu: defaultMenuRef.path,
      legacyMenuExists: defaultMenuSnap.exists,
      legacyMenuStatus: defaultStatus,
      refsDeleted: commit ? refsToDelete.map((ref) => ref.path) : [],
      refsToDelete: refsToDelete.map((ref) => ref.path),
    },
  }, null, 2))
}

async function main() {
  const serviceAccount = JSON.parse(await readFile(SERVICE_ACCOUNT, 'utf8'))
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
  }, `migrate-la-tapberne-main-${Date.now()}`)
  const db = getFirestore(app, DATABASE_ID)
  const bucket = getStorage(app).bucket(STORAGE_BUCKET)
  const basePath = `apps/${APP_ID}/kitchens/${KITCHEN_ID}`

  if (cleanupMainCopy) {
    await cleanupSourceUploadOnly({ db, bucket, basePath })
    return
  }

  if (cleanupDefaultMenu) {
    await cleanupDefaultMenuOnly({ db, basePath })
    return
  }

  const runPath = await latestRunPath()
  const run = JSON.parse(await readFile(runPath, 'utf8'))
  const sections = extractedSections(run)
  const structure = buildStructure(sections)
  const menuItemsCount = structure.reduce(
    (count, section) => count + section.items.length,
    0
  )
  const menuRef = db.doc(`${basePath}/menus/${MENU_ID}`)
  const sourceUploadRef = db.doc(`${basePath}/menu-uploads/${SOURCE_UPLOAD_ID}`)
  const targetUploadRef = db.doc(`${basePath}/menu-uploads/${TARGET_UPLOAD_ID}`)
  const [menuSnap, sourceUploadSnap, targetUploadSnap, dishesSnap] =
    await Promise.all([
      menuRef.get(),
      sourceUploadRef.get(),
      targetUploadRef.get(),
      db.collection(`${basePath}/dishes`).get(),
    ])

  if (!menuSnap.exists) throw new Error(`Missing ${menuRef.path}`)
  if (!sourceUploadSnap.exists) throw new Error(`Missing ${sourceUploadRef.path}`)

  const sourceUpload = sourceUploadSnap.data() || {}
  const copiedSourceFiles = await copySourceFiles(bucket, sourceUpload)
  const targetUploadPayload = restampUpload(sourceUpload, copiedSourceFiles)
  const existingDishes = new Map(
    dishesSnap.docs.map((doc) => [doc.id, doc.data() || {}])
  )
  const staleDishIds = dishesSnap.docs
    .map((doc) => doc.id)
    .filter((id) => !structure.some((section) =>
      section.items.some((item) => item.dish_id === id)
    ))
    .sort()

  const batch = db.batch()
  const deletedMenuChildren = await deleteMenuSections(batch, menuRef)
  const menu = menuSnap.data() || {}

  batch.set(
    menuRef,
    {
      id: MENU_ID,
      kitchen_id: KITCHEN_ID,
      name: clean(menu.name) || 'Comida Casera',
      description: clean(menu.description) || 'Swiss Alpine Tapas',
      status: 'published',
      source_upload_id: TARGET_UPLOAD_ID,
      ai_source_run_id: clean(run.id),
      ai_source_model: clean(run.extracted?.model),
      updated: stamp(),
    },
    { merge: true }
  )

  batch.set(targetUploadRef, targetUploadPayload, { merge: true })

  for (const section of structure) {
    const sectionRef = menuRef.collection('sections').doc(section.id)
    batch.set(sectionRef, {
      id: section.id,
      kitchen_id: KITCHEN_ID,
      menu_id: MENU_ID,
      label: section.label,
      description: '',
      status: 'active',
      sort_order: section.sort_order,
      created: stamp(),
      updated: stamp(),
    })

    for (const item of section.items) {
      const dishRef = db.doc(`${basePath}/dishes/${item.dish_id}`)
      batch.set(dishRef, {
        ...item.dish,
        kitchen_id: KITCHEN_ID,
        source_upload_id: TARGET_UPLOAD_ID,
        source_file_ids: item.source_file_ids,
        updated: stamp(),
        created: existingDishes.get(item.dish_id)?.created || stamp(),
      }, { merge: true })

      batch.set(sectionRef.collection('items').doc(item.id), {
        id: item.id,
        kitchen_id: KITCHEN_ID,
        menu_id: MENU_ID,
        section_id: section.id,
        dish_id: item.dish_id,
        price: item.price,
        price_options: item.price_options,
        status: 'active',
        sort_order: item.sort_order,
        source_file_ids: item.source_file_ids,
        created: stamp(),
        updated: stamp(),
      })
    }
  }

  if (deleteStaleDishes) {
    staleDishIds.forEach((id) => batch.delete(db.doc(`${basePath}/dishes/${id}`)))
  }

  if (commit) {
    await batch.commit()
  }

  const deletedSourcePaths = await deleteSourceUpload(
    db,
    bucket,
    basePath,
    sourceUpload
  )

  console.log(JSON.stringify({
    commit,
    runPath,
    appId: APP_ID,
    kitchenId: KITCHEN_ID,
    menuId: MENU_ID,
    sourceUploadId: SOURCE_UPLOAD_ID,
    targetUploadId: TARGET_UPLOAD_ID,
    plan: {
      targetMenu: menuRef.path,
      targetUpload: targetUploadRef.path,
      sourceUploadDeleted: sourceUploadRef.path,
      targetUploadAlreadyExists: targetUploadSnap.exists,
      copiedSourceFiles,
      deletedSourcePaths,
      replacedMenuChildren: deletedMenuChildren,
      sections: structure.length,
      menuItems: menuItemsCount,
      dishesUpserted: menuItemsCount,
      staleDishes: staleDishIds,
      staleDishesDeleted: commit && deleteStaleDishes ? staleDishIds : [],
    },
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
