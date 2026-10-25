<template>
  <div v-if="permissionsPending || outcome === 'pending'" role="status">
    Loading post…
  </div>
  <UAlert v-else-if="!canPublishBlog" title="Admins only" color="warning" />
  <div v-else-if="outcome === 'error'" class="space-y-2">
    <UAlert title="The post could not be loaded." color="error" />
    <FireCopyError message="The post could not be loaded." />
  </div>
  <UAlert
    v-else-if="outcome === 'empty' || (outcome === 'ready' && !post)"
    title="Post not found"
    color="warning"
  />
  <form v-else-if="post && baseline" class="space-y-6" @submit.prevent="save">
    <p class="text-sm text-muted">
      Editing /blog/{{ slug }} · {{ post.author.display_name }}
    </p>
    <UAlert
      v-if="conflict"
      title="This post changed while you were editing."
      description="Reload the saved version before making further changes."
      color="warning"
    />
    <fieldset :disabled="saving || conflict" class="space-y-4">
      <UFormField label="Title" name="title"
        ><UInput v-model="draft.title" aria-label="Title" class="w-full"
      /></UFormField>
      <UFormField label="Search description" name="description"
        ><UTextarea
          v-model="draft.metaDescription"
          aria-label="Search description"
          class="w-full"
          :rows="3"
      /></UFormField>
      <UFormField label="Article content (HTML)" name="content"
        ><UTextarea
          v-model="draft.content"
          aria-label="Article content (HTML)"
          class="w-full font-mono"
          :rows="18"
      /></UFormField>
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        @click="preview = !preview"
        >{{ preview ? 'Hide preview' : 'Preview' }}</UButton
      >
      <iframe
        v-if="preview"
        title="Article preview"
        sandbox=""
        :srcdoc="previewDocument"
        class="w-full h-[36rem] rounded border"
      />
      <p v-if="hasTranslations" class="text-sm text-muted">
        This edits the original article. Existing translations remain unchanged
        and need their own review.
      </p>
      <UCheckbox
        v-model="review.privacy_reviewed"
        label="I reviewed the article for private information."
      />
      <UCheckbox
        v-model="review.facts_reviewed"
        label="I verified the factual claims."
      />
      <UCheckbox
        v-model="review.names_approved"
        label="Every remaining name is approved for publication."
      />
      <UCheckbox v-model="aiAssisted" label="This update was AI-assisted." />
    </fieldset>
    <div v-if="error" role="alert" class="space-y-2">
      <p>{{ error }}</p>
      <FireCopyError :message="error" />
    </div>
    <p v-if="saved" role="status">Changes saved.</p>
    <div class="flex gap-3">
      <UButton type="submit" :loading="saving" :disabled="!canSave"
        >Save changes</UButton
      >
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        :disabled="saving"
        @click="loadSaved"
        >Reload saved version</UButton
      >
      <UButton :to="`/blog/${slug}`" color="neutral" variant="ghost"
        >View post</UButton
      >
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useBlogCommand } from '../../composables/authoring/useBlogCommand'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useBlogPermissions } from '../../composables/useBlogPermissions'
import { useBlogUpdate } from '../../composables/firestore/mutations/useBlogUpdate'
import { isBlogPostInRuntimeScope } from '../../composables/firestore/utils/blogScope'
import { BlogPostStorage, type BlogPost } from '../../utils/blog-post'
import { normalizeBlogPost } from '../../utils/normalize-blog-post'
import { buildBlogEditorialUpdate } from '../../utils/blog-editor'

const props = defineProps<{ slug: string }>()
const { uid } = useAuth()
const { canPublishBlog, pending: permissionsPending } = useBlogPermissions()
const runtime = useFireUXConfig()
const { firestoreFetchDoc } = useFirestoreRead()
const source = firestoreFetchDoc<BlogPost>(
  BlogPostStorage.collection,
  computed(() =>
    !permissionsPending.value && canPublishBlog.value && uid.value
      ? props.slug
      : null
  )
)
const outcome = source.outcome
const post = computed(() => {
  if (outcome.value !== 'ready' || !source.value) return null
  const value = normalizeBlogPost(props.slug, source.value)
  return value && isBlogPostInRuntimeScope(value, runtime) ? value : null
})
const { captureIntent, scopeEpoch } = useBlogCommand([() => props.slug])
const { updateBlogPost } = useBlogUpdate()
const draft = reactive({ title: '', content: '', metaDescription: '' })
const review = reactive({
  privacy_reviewed: false,
  facts_reviewed: false,
  names_approved: false,
})
const aiAssisted = ref(false)
const baseline = ref('')
const saving = ref(false)
watch(
  scopeEpoch,
  () => {
    saving.value = false
    saved.value = false
    baseline.value = ''
    error.value = ''
  },
  { flush: 'sync' }
)
const saved = ref(false)
const error = ref('')
const preview = ref(false)
const fingerprint = computed(() =>
  post.value ? JSON.stringify(post.value) : ''
)
const conflict = computed(() =>
  Boolean(baseline.value && fingerprint.value !== baseline.value)
)
const hasTranslations = computed(
  () => Object.keys(post.value?.sproochli?.translations ?? {}).length > 0
)
const canSave = computed(
  () =>
    !saving.value &&
    !conflict.value &&
    outcome.value === 'ready' &&
    canPublishBlog.value &&
    !permissionsPending.value &&
    Boolean(uid.value) &&
    review.privacy_reviewed &&
    review.facts_reviewed &&
    review.names_approved
)
const escape = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
const previewDocument = computed(
  () =>
    `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>body{font:16px/1.6 system-ui;max-width:760px;margin:24px auto;padding:0 20px}pre{white-space:pre-wrap}img{max-width:100%}</style></head><body><h1>${escape(draft.title)}</h1>${draft.content}</body></html>`
)
function resetReview() {
  Object.assign(review, {
    privacy_reviewed: false,
    facts_reviewed: false,
    names_approved: false,
  })
  saved.value = false
}
watch(draft, resetReview, { flush: 'sync' })
function loadSaved() {
  if (!post.value) return
  Object.assign(draft, {
    title: post.value.title,
    content: post.value.content,
    metaDescription: post.value.metaDescription,
  })
  aiAssisted.value = post.value.editorial_review?.source_kind === 'ai-assisted'
  baseline.value = fingerprint.value
  resetReview()
  error.value = ''
}
watch(
  () => [props.slug, uid.value, canPublishBlog.value],
  () => {
    baseline.value = ''
    Object.assign(draft, { title: '', content: '', metaDescription: '' })
    error.value = ''
  },
  { flush: 'sync' }
)
watch(
  post,
  (value) => {
    if (value && !baseline.value) loadSaved()
  },
  { immediate: true }
)
async function save() {
  if (!canSave.value || !post.value) return
  const isCurrent = captureIntent()
  const savedSlug = props.slug
  saving.value = true
  error.value = ''
  let changes
  try {
    changes = buildBlogEditorialUpdate(post.value, draft, {
      ...review,
      source_kind: aiAssisted.value ? 'ai-assisted' : 'human',
    })
  } catch (reason) {
    error.value =
      reason instanceof Error
        ? reason.message
        : 'Review the article before saving.'
    saving.value = false
    return
  }
  try {
    await updateBlogPost({ blogPostId: savedSlug, changes })
    if (isCurrent() && props.slug === savedSlug) {
      loadSaved()
      saved.value = true
    }
  } catch {
    if (isCurrent() && props.slug === savedSlug)
      error.value =
        'The update was not saved. Check the article and review confirmations, then try again.'
  } finally {
    if (isCurrent() && props.slug === savedSlug) saving.value = false
  }
}
</script>
