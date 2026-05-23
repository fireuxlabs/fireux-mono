import { readFile } from 'node:fs/promises'
import { initializeApp, cert } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const serviceAccountPath = 'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
const databaseId = 'qrdoc'
const collectionName = 'qrdoc_documents'
const bucketName = 'fireux-2005.firebasestorage.app'
const storagePrefix = 'qrdocs/documents/'

const slug = 'qrdocs-terms-and-how-to-use'
const fileName = 'qrdocs-terms-and-how-to-use.pdf'
const pdfPath = 'output/pdf/qrdocs-terms-and-how-to-use.pdf'
const storagePath = `${storagePrefix}${slug}/raw/${fileName}`

const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'))
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
})

const db = getFirestore(app, databaseId)
const bucket = getStorage(app).bucket(bucketName)

const snap = await db.collection(collectionName).get()
for (const doc of snap.docs) {
  await doc.ref.delete()
}

const [files] = await bucket.getFiles({ prefix: storagePrefix })
for (const file of files) {
  await file.delete({ ignoreNotFound: true })
}

const pdf = await readFile(pdfPath)
await bucket.file(storagePath).save(pdf, {
  contentType: 'application/pdf',
  resumable: false,
  metadata: {
    cacheControl: 'public, max-age=300',
  },
})

await db.collection(collectionName).doc(slug).set({
  id: slug,
  title: 'QRdocs Terms and How To Use',
  slug,
  file_url: `/api/docs/${slug}/file`,
  file_type: 'application/pdf',
  file_name: fileName,
  storage_path: storagePath,
  owner_id: 'fireux',
  is_public: true,
  created_at: FieldValue.serverTimestamp(),
  updated_at: FieldValue.serverTimestamp(),
})

console.log(`deleted documents: ${snap.size}`)
console.log(`deleted files: ${files.length}`)
console.log(`created document: ${slug}`)
console.log(`/docs/${slug}`)
console.log(`/docs/${slug}/qr`)
