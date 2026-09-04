import type { DocumentReference, Firestore } from 'firebase-admin/firestore'

export async function countDocumentDescendants(root: DocumentReference) {
  let count = 0
  for (const collection of await root.listCollections()) {
    for (const child of await collection.listDocuments()) {
      if ((await child.get()).exists) count += 1
      count += await countDocumentDescendants(child)
    }
  }
  return count
}

export async function deleteDocumentTree(db: Firestore, root: DocumentReference) {
  await db.recursiveDelete(root)
}
