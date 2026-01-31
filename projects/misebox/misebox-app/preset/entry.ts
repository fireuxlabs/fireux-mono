import '#internal/nitro/virtual/polyfill'
import { useNitroApp } from '#internal/nitro'
import { onRequest, setGlobalOptions } from 'firebase-functions/v2/https'
import { ecosystemConfig } from 'fireux-misebox/src/config/firebase/ecosystem.config'

setGlobalOptions({ region: ecosystemConfig.ssrRegion ?? 'europe-west1' })

const nitroApp = useNitroApp()
export default onRequest((req, res) => nitroApp.localCall(req, res))
