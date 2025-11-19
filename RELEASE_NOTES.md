# Tello Scratch Extension – v1.3.2-toin.0 (Toin Edition v0)

## Overview
This Toin Edition refresh builds on the scratch3-tello fork to deliver a ready-to-use Tello control experience for classrooms and workshops. The release packages the curated Windows build workflow, the Wi‑Fi SSID selector block, and interface wording tailored for the Toin-branded build.

## Highlights
- **One-step Windows build**: Includes the PowerShell helper so Windows users can clone, build, and package the Electron app without manually resolving dependency issues.
- **SSID-aware connection block**: The `connectTo` boolean block now lets you pick the exact Tello SSID from inside Scratch, returning `true` when the Wi‑Fi connection succeeds and `false` when it fails.
- **Stable dependency set**: Locks `react-responsive` to 4.1.0 to avoid npm peer-dependency conflicts on Node.js 16/NPM 8 and keep the GUI build reliable.
- **Toin-branded experience**: The extension name and messaging call out the Toin Edition so learners can confirm they are using the correct release.

## Compatibility and setup
- Verified on Windows with Node.js v16.20.0 and npm 8.19.4 using the bundled `build-scratch3-tello.ps1` script.
- macOS and Linux users can continue to rely on `build.sh` for the standard build flow.

## Getting started
1. Clone the repository and run the appropriate build script for your platform.
2. Launch the generated Electron app.
3. Enable the Tello extension, use `connectTo` to join your drone’s SSID, and start flying with the familiar Scratch blocks.

## Notes for this edition
- If connection fails, restart both the app and the drone, then retry `connectTo`.
- When the drone does not take off after `takeoff`, try the “clear command queue” block and resend the command.
