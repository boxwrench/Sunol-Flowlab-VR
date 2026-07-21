# Sunol FlowLab VR v0.1.0

Sunol FlowLab VR v0.1.0 is the first public release of a personal educational
portfolio project about drinking-water coagulation.

- [Launch the hosted experience](https://boxwrench.github.io/Sunol-Flowlab-VR/)
- [Watch the narrated Quest demonstration](https://github.com/boxwrench/Sunol-Flowlab-VR/releases/download/v0.1.0/sunol-flowlab-vr-v0.1.0-demo.mp4)

## What ships

- One live deterministic observation-tank simulation.
- Eleven relative coagulant doses, from 0 through 10.
- A complete physical treatment cycle: rapid mix, flocculation, settling,
  measurement, result, and refill.
- A dimensionless Relative Turbidity gauge and mounted dose-response plot.
- Six static canonical jar summaries for doses 0, 2, 4, 6, 8, and 10.
- Bounded optical-load result replay without particle recording or simulation
  reruns.
- A four-wall water-quality lab with owner-created Sunol and Hetchy scenery.
- Generated lab ambience, periodic process details, sparse music, and a
  physical mute control.
- Seated Meta Quest WebXR and Chrome/Chromium desktop viewing at the same URL.

## Release evidence

The hosted candidate passed owner-operated Quest 3 review, including immersive
entry, corrected seated height, Dose 0/5/10 trials with refills, exit and
re-entry, final visual/audio review, and direct headset-view recording. The
three-minute release video preserves the real operator's head and controller
movement and includes an approved synthetic narration.

Automated release checks cover repository contracts, deterministic simulation
behavior, unit and integration behavior, type checking, linting, formatting,
production builds, browser scenarios, and the headless benchmark.

## Important boundaries

This is a phenomenological coagulation teaching model. It is not calibrated
NTU instrumentation, dose-prediction software, CFD, a plant simulator, or a
source of operating guidance. Displayed values and the fictionalized lab are
representative.

Mobile-specific support and a sideloadable APK are not included in v0.1.0.
