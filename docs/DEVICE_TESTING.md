# Quest and Browser Test Route

## Target device

- Headset: Meta Quest 3
- Developer Mode: enabled (confirmed by project owner on 2026-07-14)
- Headset OS: Android 14, build `UP1A.231005.007.A1` (captured 2026-07-15)
- Quest Browser: `149.0.0.24.3.1013217646` (captured 2026-07-15)
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

## Accepted local physical route

On 2026-07-15, device serial `2G0YC5ZG0M052K` was authorized and reported as
one Quest 3 in ADB state `device`. The development server was mapped with
`adb reverse tcp:5173 tcp:5173`, and Quest Browser loaded the secure loopback
origin. Remote Chrome inspection confirmed `window.isSecureContext` and
`navigator.xr`, immersive session entry, both handed controllers, trigger/select
events, selection of the development target, and a clean session exit with the
page still usable. Exact metrics and version evidence are recorded in
[PERFORMANCE.md](PERFORMANCE.md#2026-07-15---physical-quest-3-local-preflight).

This accepts the local physical-device subset only. It does not satisfy the
hosted-HTTPS smoke deployment or later headset ergonomics, readability,
thermal, endurance, and release gates.

The later Workstream 03D replacement-model visibility and short rolling-
performance rerun also passed on this route. That evidence closes the Batch 03
device-visibility check while leaving thermal, endurance, later interaction
ergonomics, hosted deployment, and release work open. Exact results are in
[PERFORMANCE.md](PERFORMANCE.md#2026-07-15---workstream-03d-physical-quest-visibility-rerun).

## Desktop targets

- Primary: current stable Chrome on Windows
- Secondary: current stable Firefox on Windows
- Chromium cross-check and Quest remote inspection: current stable Edge/Chrome DevTools
- Mobile fallback: current mobile Safari or Chrome available at the release gate

## Gate capture

For every real-device gate, record headset model, OS version, Quest Browser version, build/config hash, connection route, controller handedness, average/p95 frame time, draw calls, and any console errors in `docs/PERFORMANCE.md`.
