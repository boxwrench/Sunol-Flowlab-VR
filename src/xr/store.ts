import { createXRStore } from '@react-three/xr'

import { XR_AUTO_SESSION_OFFER, XR_EMULATOR_PROFILE } from './config'

export const xrStore = createXRStore({
  emulate: import.meta.env.DEV ? XR_EMULATOR_PROFILE : false,
  offerSession: XR_AUTO_SESSION_OFFER,
})

if (import.meta.env.DEV) {
  const unsubscribe = xrStore.subscribe((state) => {
    if (state.emulator === undefined) return

    // Desktop Chrome can expose navigator.xr while supporting no immersive
    // sessions. IWER otherwise preserves that unusable partial runtime.
    state.emulator.installRuntime({ forceInstall: true })
    unsubscribe()
  })
}
