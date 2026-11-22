import { defineNuxtPlugin } from '#imports'
import { getAdminApp } from '../../server/utils/getAdmin'

export default defineNuxtPlugin(() => {
  // VueFire runs next and injects this same named Admin app.
  getAdminApp()
})
