import { readFile } from 'node:fs/promises'
import { initializeApp, cert } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const serviceAccountPath = 'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
const pdfPath = 'output/pdf/yellow-velo-terms-and-agreements.pdf'
const slug = 'yellow-velo-terms-and-agreements'
const fileName = 'yellow-velo-terms-and-agreements.pdf'
const storagePath = `qrdocs/documents/${slug}/raw/${fileName}`
const obsoleteSlug = 'yellow-velo-rental-terms'

const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'))
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
})

const pdf = await readFile(pdfPath)
const bucket = getStorage(app).bucket('fireux-2005.firebasestorage.app')
await bucket.file(storagePath).save(pdf, {
  contentType: 'application/pdf',
  resumable: false,
  metadata: {
    cacheControl: 'public, max-age=300',
  },
})

const db = getFirestore(app, 'qrdoc')
const obsoleteSnap = await db.collection('qrdoc_documents').doc(obsoleteSlug).get()
if (obsoleteSnap.exists) {
  const obsolete = obsoleteSnap.data()
  if (obsolete?.storage_path) {
    await bucket.file(String(obsolete.storage_path)).delete({ ignoreNotFound: true })
  }
  await obsoleteSnap.ref.delete()
}

await db.collection('qrdoc_documents').doc(slug).set(
  {
    id: slug,
    title: slug,
    slug,
    file_url: `/api/docs/${slug}/file`,
    file_type: 'application/pdf',
    file_name: fileName,
    storage_path: storagePath,
    owner_id: 'anonymous',
    is_public: true,
    updated_at: FieldValue.serverTimestamp(),
    created_at: FieldValue.serverTimestamp(),
  },
  { merge: true }
)

console.log(`published ${slug}`)
console.log(`/docs/${slug}`)
console.log(`/docs/${slug}/qr`)
