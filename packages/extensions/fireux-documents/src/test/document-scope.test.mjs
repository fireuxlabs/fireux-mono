import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, computed, watch, onScopeDispose } from 'vue'
function load(file, deps, name, vue = false) {
  deps = {
    useCommandScope: compileFunction(
      `${stripTypeScriptTypes(
        readFileSync(
          new URL(
            '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
            import.meta.url
          ),
          'utf8'
        )
          .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
          .replace(/^export /gm, '')
      )};return useCommandScope`,
      ['watch', 'onScopeDispose']
    )(watch, deps.onBeforeUnmount ?? onScopeDispose),
    useUserSession: () => ({ appUser: ref({ created: { at: 'one' } }) }),
    ...deps,
  }
  let source = readFileSync(new URL(file, import.meta.url), 'utf8')
  if (vue)
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${name}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function deferred() {
  let resolve, reject
  const promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}
function setup() {
  const currentUser = ref({ uid: 'u' }),
    routePath = ref('/documents'),
    portfolio = {
      id: ref('p'),
      appId: ref('app'),
      canWrite: ref(true),
      targetOutcome: ref('ready'),
    },
    disposed = []
  const useDocumentScope = load(
    '../runtime/portfolio/composables/useDocumentScope.ts',
    {
      watch,
      onBeforeUnmount: (fn) => disposed.push(fn),
      useAuth: () => ({ currentUser }),
      useRoute: () => ({
        get fullPath() {
          return routePath.value
        },
      }),
    },
    'useDocumentScope'
  )
  return { currentUser, routePath, portfolio, disposed, useDocumentScope }
}
const requirePortfolioWorkspaceWrite = (p) => {
  if (!p.canWrite.value) throw Error('No access')
  return p.id.value
}
test('Document requests snapshot multipart/JSON and reject every scope roundtrip during credentials/response', async () => {
  for (const kind of ['upload', 'links'])
    for (const stage of ['auth', 'token', 'response'])
      for (const change of [
        'stable',
        'account',
        'app',
        'portfolio',
        'route',
        'logout',
        'dispose',
      ]) {
        const h = setup(),
          auth = deferred(),
          token = deferred(),
          response = deferred(),
          calls = [],
          user = { uid: 'u', getIdToken: () => token.promise }
        h.currentUser.value = user
        const mutate = load(
          '../runtime/portfolio/composables/useDocumentMutation.ts',
          {
            useAuth: () => ({ currentUser: h.currentUser }),
            useDocumentScope: h.useDocumentScope,
            requirePortfolioWorkspaceWrite,
            useRequireUser: () => auth.promise,
            $fetch: (...args) => {
              calls.push(args)
              return response.promise
            },
            FormData,
          },
          'useDocumentMutation'
        )(h.portfolio)
        const value =
          kind === 'upload' ? new FormData() : { targetLabel: 'Original' }
        if (kind === 'upload') {
          value.set('notes', 'Original')
          value.set('file', new File(['file'], 'lease.pdf'))
        }
        const pending = mutate(kind, value),
          done =
            change === 'stable' || stage === 'response'
              ? pending
              : assert.rejects(pending, /changed/)
        if (stage !== 'auth') {
          auth.resolve(user)
          await Promise.resolve()
        }
        if (stage === 'response') {
          token.resolve('token')
          await Promise.resolve()
        }
        kind === 'upload'
          ? value.set('notes', 'Changed')
          : (value.targetLabel = 'Changed')
        if (change === 'account' || change === 'logout') {
          h.currentUser.value = change === 'logout' ? null : { uid: 'b' }
          h.currentUser.value = user
        } else if (change === 'app') {
          h.portfolio.appId.value = 'b'
          h.portfolio.appId.value = 'app'
        } else if (change === 'portfolio') {
          h.portfolio.id.value = 'q'
          h.portfolio.id.value = 'p'
        } else if (change === 'route') {
          h.routePath.value = '/other'
          h.routePath.value = '/documents'
        } else if (change === 'dispose') h.disposed.forEach((fn) => fn())
        auth.resolve(user)
        token.resolve('token')
        response.resolve({ id: 'd', portfolioId: 'p', ok: true })
        await done
        assert.equal(
          calls.length,
          change === 'stable' || stage === 'response' ? 1 : 0
        )
        if (calls.length) {
          const body = calls[0][1].body
          assert.equal(
            kind === 'upload' ? body.get('notes') : body.targetLabel,
            'Original'
          )
          assert.equal(
            kind === 'upload' ? body.get('portfolioId') : body.portfolioId,
            'p'
          )
        }
      }
})
function page(h, pending, calls, readers = {}) {
  return load(
    '../runtime/portfolio/components/Workspace/Documents/Index.vue',
    {
      ref,
      computed,
      definePageMeta: () => {},
      useDocumentScope: h.useDocumentScope,
      useActivePortfolio: () => h.portfolio,
      usePortfolioWorkspaceChildPath: () => ref(''),
      DocumentStorage: { collection: 'documents' },
      usePortfolioDocuments: () =>
        readers.documents ?? { collection: ref([]), outcome: ref('empty') },
      usePortfolioDocumentLinks: () =>
        readers.links ?? { collection: ref([]), outcome: ref('empty') },
      useDocumentStorage: () => ({
        uploadFile: (input) => {
          calls.push(input)
          return pending.promise
        },
      }),
      linkDocumentToEntity: () => ({
        linkDocumentToEntity: (input) => {
          calls.push(input)
          return pending.promise
        },
      }),
      documentLinkTargetTypes: ['property'],
      useDocumentInterface: () => ({ pill: (x) => x }),
      crypto: { randomUUID: () => 'request' },
    },
    '({uploadSelectedFile,createLink,selectedFile,uploadNotes,uploadBusy,linkBusy,linkDocumentId,linkTargetId,linkTargetLabel,writeError,outcome,documents,links,linkCountByDocument})',
    true
  )
}
test('Page suppresses stale success/error/finally, retains retry IDs and does not clear newer draft', async () => {
  for (const kind of ['upload', 'link'])
    for (const changed of [false, true])
      for (const failed of [false, true]) {
        const h = setup(),
          pending = deferred(),
          calls = [],
          api = page(h, pending, calls)
        api.selectedFile.value = new File(['file'], 'lease.pdf')
        api.uploadNotes.value = 'Original'
        api.linkDocumentId.value = 'd'
        api.linkTargetId.value = 'target'
        api.linkTargetLabel.value = 'Original'
        const result =
          kind === 'upload' ? api.uploadSelectedFile() : api.createLink(true)
        if (changed) {
          h.portfolio.id.value = 'q'
          h.portfolio.id.value = 'p'
          api.uploadBusy.value = true
          api.linkBusy.value = true
        } else {
          api.uploadNotes.value = 'New draft'
          api.linkTargetLabel.value = 'New draft'
        }
        failed ? pending.reject(Error('Failure')) : pending.resolve('d')
        await result
        assert.equal(
          kind === 'upload' ? calls[0].notes : calls[0].targetLabel,
          'Original'
        )
        if (changed) {
          assert.equal(api.writeError.value, '')
          assert.equal(api.uploadBusy.value, true)
          assert.equal(api.linkBusy.value, true)
        } else {
          assert.equal(
            kind === 'upload'
              ? api.uploadNotes.value
              : api.linkTargetLabel.value,
            'New draft'
          )
          assert.equal(Boolean(api.writeError.value), failed)
        }
      }
})
test('Page retries unchanged request with the same request ID', async () => {
  for (const kind of ['upload', 'link']) {
    const h = setup(),
      calls = [],
      api = page(h, { promise: Promise.reject(Error('uncertain')) }, calls)
    api.selectedFile.value = new File(['file'], 'lease.pdf')
    api.uploadNotes.value = 'note'
    api.linkDocumentId.value = 'd'
    api.linkTargetId.value = 'x'
    await (kind === 'upload' ? api.uploadSelectedFile() : api.createLink())
    await (kind === 'upload' ? api.uploadSelectedFile() : api.createLink())
    assert.equal(calls.length, 2)
    assert.equal(calls[0].requestId, calls[1].requestId)
  }
})

test('An empty document vault preserves separately loaded links, and hides them on failed or pending reads', () => {
  const h = setup(),
    documents = { collection: ref([]), outcome: ref('empty') },
    links = {
      collection: ref([{ id: 'one', document_id: 'missing-document' }]),
      outcome: ref('ready'),
    }
  const api = page(h, { promise: Promise.resolve() }, [], { documents, links })
  assert.equal(api.outcome.value, 'empty')
  assert.equal(api.links.value.length, 1)
  assert.equal(api.linkCountByDocument.value['missing-document'], 1)
  for (const state of ['pending', 'error']) {
    links.outcome.value = state
    assert.equal(api.outcome.value, state)
    assert.deepEqual(api.links.value, [])
  }
  links.outcome.value = 'ready'
  h.portfolio.targetOutcome.value = 'empty'
  assert.deepEqual(api.links.value, [])
})
