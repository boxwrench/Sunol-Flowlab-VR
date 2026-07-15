# Quest and Browser Test Route

## Target device

- Headset: Meta Quest 3
- Developer Mode: enabled (confirmed by project owner on 2026-07-14)
- Headset OS and Quest Browser versions: capture from the device at each acceptance gate
- Gate approver: project owner

## Local secure-context route

Android SDK Platform-Tools 37.0.1 is the supported debugging tool. Connect the Quest 3 by USB, accept the headset's USB debugging prompt for this computer, and verify that `adb devices -l` reports one authorized device.

Start Vite on the workstation and map the Quest loopback port to it:

```powershell
npm run dev
adb reverse tcp:5173 tcp:5173
```

Open `http://localhost:5173` in Quest Browser. Loopback origins are treated as potentially trustworthy for secure-context purposes; the application must still verify `window.isSecureContext` and `navigator.xr` before offering immersive entry. XR session entry is intentionally user-initiated through **Enter VR**; automatic session offers are disabled to prevent competing IWER/browser offers. Batch 01 must prove actual `immersive-vr` entry, both controller poses/select input, session exit, and Chrome remote inspection on this route.

Vite's local HTTPS mode remains available for same-network testing when loopback forwarding is unsuitable. A hosted HTTPS smoke URL is required before the Batch 01B gate closes; choosing or writing to a public host requires separate approval.

## Desktop targets

- Primary: current stable Chrome on Windows
- Secondary: current stable Firefox on Windows
- Chromium cross-check and Quest remote inspection: current stable Edge/Chrome DevTools
- Mobile fallback: current mobile Safari or Chrome available at the release gate

## Gate capture

For every real-device gate, record headset model, OS version, Quest Browser version, build/config hash, connection route, controller handedness, average/p95 frame time, draw calls, and any console errors in `docs/PERFORMANCE.md`.
