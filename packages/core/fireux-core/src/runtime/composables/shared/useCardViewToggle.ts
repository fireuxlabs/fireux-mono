import { ref, watch, type ComputedRef, type Ref } from 'vue'

type View = 'preview' | 'profile'

type ViewToggleSource = (() => boolean) | Ref<boolean> | ComputedRef<boolean>

type UseCardViewToggleOptions = {
  /** Optional initial view; defaults to `preview`. */
  initialView?: View
}

const asPredicate = (source: ViewToggleSource) => {
  if (typeof source === 'function') return source
  return () => Boolean(source.value)
}

export const useCardViewToggle = (
  hasData: ViewToggleSource,
  options: UseCardViewToggleOptions = {}
) => {
  const view = ref<View>(options.initialView ?? 'preview')

  const toggleView = () => {
    view.value = view.value === 'preview' ? 'profile' : 'preview'
  }

  const setView = (next: View) => {
    view.value = next
  }

  watch(
    () => Boolean(asPredicate(hasData)()),
    (present) => {
      if (!present) view.value = 'preview'
    }
  )

  return {
    view,
    toggleView,
    setView,
  }
}
