# Local Video Speed

Build a simple mobile-first Video Speed Player web app optimized for iPhone Safari and installable as a PWA. Core requirements: user selects a local video from their phone using a file picker; video is never uploaded; support common iPhone video files including MOV/QuickTime and MP4 without rejecting based only on MIME type; play/pause; native video controls; scrub; jump -10 sec/+10 sec; playback speed slider from 0.25x to 3x with presets 0.5x, 1x, 1.5x, 2x; preserve selected speed when changing videos. Use playsinline. For local playback, use URL.createObjectURL(file), properly revoke old object URLs, clear the previous source before loading a new one, call video.load(), and show simple helpful errors for invalid/empty files, unsupported codec/container, metadata load failure, abort, or stalled playback. Add useful status feedback for loadedmetadata, loadeddata, canplay, error, abort, stalled. Do not use a backend, database, auth, analytics, uploads, or remote storage. Make it a clean dark mobile UI with large touch targets and responsive layout. Make it installable as a PWA with manifest, icons, standalone display, service worker/offline app-shell caching, and HTTPS-compatible deployment. The app should work in iPhone Safari, installed iPhone Home Screen mode, macOS Safari, and desktop Chrome as far as browser codec support allows. Keep the project minimal and production-ready.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://speed-play-local.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/da1a9e92-9064-40ff-a044-ca14eea9edc0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
