import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import sharp from 'sharp'

function load(file, dependencies, result) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /m, 'const handler = ')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (value) => Object.assign(Error(value.statusMessage), value)
const multipartField = (parts, name) =>
  parts.find((part) => part.name === name)?.data.toString() || ''
const multipart = load(
  '../runtime/server/utils/uploads/multipart.ts',
  { createError },
  '({ readUploadedMultipartFile })'
)
const image = await sharp({
  create: { width: 2, height: 2, channels: 3, background: '#abcdef' },
})
  .png()
  .toBuffer()
function fixture({
  path = 'places/venue/image',
  data = image,
  type = 'image/png',
} = {}) {
  const writes = [],
    deletes = []
  const parts = [
    { name: 'path', data: Buffer.from(path) },
    { name: 'file', filename: 'image', type, data },
  ]
  const upload = load(
    '../runtime/server/utils/uploads/image.ts',
    {
      randomUUID: () => 'unique-image',
      createError,
      sharp,
      readMultipartFormData: async () => parts,
      setResponseHeader: () => {},
      multipartField,
      readUploadedMultipartFile: multipart.readUploadedMultipartFile,
      saveStorageFileWithDownloadToken: async (value) => {
        writes.push(value)
        return {
          ...value,
          fileUrl: 'https://fixture/image',
          bucketName: 'demo',
        }
      },
      deleteStorageFileIfExists: async (value) => deletes.push(value),
    },
    'uploadProtectedImage'
  )
  return { upload, parts, writes, deletes }
}
test('protected images use a unique revision and verified WebP output', async () => {
  const state = fixture(),
    checks = []
  assert.deepEqual(await state.upload({}, async (path) => checks.push(path)), {
    url: 'https://fixture/image',
  })
  assert.deepEqual(checks, ['places/venue/image', 'places/venue/image'])
  assert.equal(
    state.writes[0].objectPath,
    'places/venue/image/revisions/unique-image'
  )
  assert.equal(state.writes[0].contentType, 'image/webp')
  assert.equal((await sharp(state.writes[0].data).metadata()).format, 'webp')
})
test('unauthorized, malformed, oversized and falsely labelled images never write Storage', async () => {
  for (const options of [
    { path: '../other/image' },
    { data: Buffer.from('not an image') },
    { data: Buffer.alloc(10 * 1024 * 1024 + 1) },
    { type: 'application/pdf' },
  ]) {
    const state = fixture(options)
    await assert.rejects(state.upload({}, async () => {}))
    assert.equal(state.writes.length, 0)
  }
  const state = fixture()
  await assert.rejects(
    state.upload({}, async () => {
      throw createError({ statusCode: 403 })
    })
  )
  assert.equal(state.writes.length, 0)
})
test('revocation while processing removes the new object and returns no URL', async () => {
  const state = fixture()
  let checks = 0
  await assert.rejects(
    state.upload({}, async () => {
      if (++checks === 2) throw createError({ statusCode: 403 })
    }),
    { statusCode: 403 }
  )
  assert.equal(state.writes.length, 1)
  assert.equal(state.deletes[0].objectPath, state.writes[0].objectPath)
})

test('protected client upload never falls back to browser Storage after a denied command', async () => {
  let browserWrites = 0,
    requests = 0
  const storage = { app: { options: { storageBucket: 'demo' } } }
  const user = { uid: 'owner', getIdToken: async () => 'test-token' }
  const currentUser = { value: user }
  const useImageStorage = load(
    '../runtime/composables/fireux/firebase/useImageStorage.ts',
    {
      useAuth: () => ({ currentUser }),
      useRuntimeConfig: () => ({}),
      useFirebaseStorage: () => storage,
      getStorage: () => storage,
      storageRef: () => ({}),
      getDownloadURL: async () => 'native-url',
      uploadBytes: async () => {
        browserWrites++
      },
      $fetch: async (_url, options) => {
        requests++
        assert.equal(options.headers.Authorization, 'Bearer test-token')
        throw createError({ statusCode: 403 })
      },
    },
    'useImageStorage'
  )
  const client = useImageStorage({ endpoint: '/api/places/images' })
  await assert.rejects(
    client.uploadImage(
      'places/venue/image',
      new Blob([image], { type: 'image/png' })
    ),
    { statusCode: 403 }
  )
  assert.equal(requests, 1)
  assert.equal(browserWrites, 0)
  user.getIdToken = async () => {
    currentUser.value = { uid: 'other' }
    return 'old-token'
  }
  await assert.rejects(
    client.uploadImage(
      'places/venue/image',
      new Blob([image], { type: 'image/png' })
    ),
    /account changed/
  )
  assert.equal(requests, 1)
})
