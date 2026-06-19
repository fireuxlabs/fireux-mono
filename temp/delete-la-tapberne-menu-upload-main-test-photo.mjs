#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { readFile } from 'node:fs/promises'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const STORAGE_BUCKET = 'misebox-78f9c.appspot.com'
const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const APP_ID = 'la-tap-berne'
const KITCHEN_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const UPLOAD_ID = 'main'
const EXPECTED_FILE_NAME = 'IMG_9006-2.jpeg'
const EXPECTED_OBJECT_PATH =
  `apps/${APP_ID}/kitchens/${KITCHEN_ID}/menu-uploads/${UPLOAD_ID}/source/${EXPECTED_FILE_NAME}`
const commit = process.argv.includes('--commit')

const text = (value) => String(value ?? '').trim()
const readRecord = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

const raw = await readFile(SERVICE_ACCOUNT, 'utf8')
const app = initializeApp({
  credential: cert(JSON.parse(raw)),
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
})
const db = getFirestore(app, DATABASE_ID)
const bucket = getStorage(app).bucket(STORAGE_BUCKET)
const uploadPath =
  `apps/${APP_ID}/kitchens/${KITCHEN_ID}/menu-uploads/${UPLOAD_ID}`
const uploadRef = db.doc(uploadPath)
const uploadSnap = await uploadRef.get()
const upload = uploadSnap.exists ? uploadSnap.data() || {} : null
const file = readRecord(upload?.file)
const fileName =
  text(upload?.file_name) || text(upload?.doc_name) || text(file.name)
const objectPath =
  text(upload?.storage_path) ||
  text(upload?.doc_storage_path) ||
  text(file.storage_path) ||
  EXPECTED_OBJECT_PATH
const storageFile = bucket.file(objectPath)
const [storageExists] = await storageFile.exists()
const status = text(upload?.status)
const appId = text(upload?.app_id)
const kitchenId = text(upload?.kitchen_id)
const safeToDelete =
  uploadSnap.exists &&
  appId === APP_ID &&
  kitchenId === KITCHEN_ID &&
  status === 'uploaded' &&
  fileName === EXPECTED_FILE_NAME &&
  objectPath === EXPECTED_OBJECT_PATH

if (!safeToDelete) {
  console.log(JSON.stringify({
    commit,
    aborted: true,
    reason: 'Kitchen menu upload did not match the expected test source shape.',
    expected: {
      uploadPath,
      appId: APP_ID,
      kitchenId: KITCHEN_ID,
      uploadId: UPLOAD_ID,
      status: 'uploaded',
      fileName: EXPECTED_FILE_NAME,
      objectPath: EXPECTED_OBJECT_PATH,
    },
    actual: {
      uploadExists: uploadSnap.exists,
      uploadPath,
      appId,
      kitchenId,
      status,
      fileName,
      objectPath,
      storageExists,
    },
  }, null, 2))
  process.exitCode = 1
} else if (!commit) {
  console.log(JSON.stringify({
    commit,
    action: 'dry-run',
    upload: {
      path: uploadPath,
      id: UPLOAD_ID,
      appId,
      kitchenId,
      status,
      fileName,
      objectPath,
    },
    storage: {
      bucket: STORAGE_BUCKET,
      objectPath,
      exists: storageExists,
    },
    note: 'Run with --commit to delete only this kitchen menu source upload and test photo object.',
  }, null, 2))
} else {
  if (storageExists) {
    await storageFile.delete()
  }
  await uploadRef.delete()

  console.log(JSON.stringify({
    commit,
    deleted: {
      uploadPath,
      storageBucket: STORAGE_BUCKET,
      objectPath,
      storageObjectExisted: storageExists,
    },
    untouched: {
      kitchenMenuPath: `apps/${APP_ID}/kitchens/${KITCHEN_ID}/menus/${UPLOAD_ID}`,
      rootMenuPath: `menus/la-tapberne-${UPLOAD_ID}`,
    },
  }, null, 2))
}
