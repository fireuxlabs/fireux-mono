// FILE: scripts/_lib/firebase-storage.mjs

/**
 * Firebase Storage helpers for admin scripts.
 */

export async function listBucketObjects(bucket, prefix) {
  const results = []
  let nextPageToken = undefined

  do {
    const [files, , apiResponse] = await bucket.getFiles({
      prefix,
      autoPaginate: false,
      maxResults: 1000,
      pageToken: nextPageToken,
    })

    for (const file of files) results.push(file.name)
    nextPageToken = apiResponse?.nextPageToken
  } while (nextPageToken)

  return results
}
