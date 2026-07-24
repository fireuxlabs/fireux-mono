import { computed } from 'vue'
import {
  interlakenCopy,
  type InterlakenCopyKey,
} from '@/content/sproochli-copy'
import type { SproochliCopyVariables } from 'fireux-sproochli/runtime/sproochli'
import { useInterlakenSproochli } from './useInterlakenSproochli'

export function useInterlakenCopy() {
  const sproochli = useInterlakenSproochli()
  const language = computed(() => sproochli.selectedLanguage.value)
  const locale = computed(() =>
    language.value === 'en' ? 'en-GB' : 'gsw-CH'
  )

  const copy = (
    key: InterlakenCopyKey,
    variables: SproochliCopyVariables = {}
  ) => interlakenCopy(key, language.value, variables)

  return {
    ...sproochli,
    copy,
    language,
    locale,
  }
}
