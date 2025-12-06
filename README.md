# Unicorn Music Player

A child-friendly React music player that reads a manifest.json file from public/manifest.json and plays songs stored under public/music.

Usage

- Add your music files under public/music in folders. Example:
  public/music/Happy Songs/song1.mp3
  public/music/Happy Songs/song2.mp3

- Generate manifest.json (the build script does this automatically before build):
  npm run generate-manifest

- Start dev server:
  npm start

  The dev server will serve the app under /<repo-name> path when using react-scripts. If you have issues with manifest not found, open http://localhost:3000/<repo-name>/manifest.json to confirm the file is reachable.

Deployment

- The project is configured for GitHub Pages. The following scripts are set in package.json:

  "prebuild": "node scripts/generate-manifest.js",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"

- To deploy:
  npm run build
  npm run deploy

Notes

- The UI contains placeholders for unicorn/princess art. Replace public/unicorn.png and any other assets as desired.

iOS background playback notes

- iOS Safari allows audio to continue playing when the browser is backgrounded or the device is locked, but playback must be started by an explicit user gesture (tap/click). The app cannot resume playback after the user force-quits (kills) Safari.

- To improve background playback compatibility on iOS Safari, this project uses a plain HTMLAudioElement and avoids WebAudio-only playback. The audio element has attributes: crossOrigin="anonymous", preload="metadata", playsInline.

- The app also sets Media Session metadata and action handlers so iOS shows track metadata and play/pause/next controls on the lock screen and Control Center.

Testing on iOS

1. Open the site in Safari on an iOS device.
2. Tap a song to start playback (user gesture required).
3. Press the Home button or swipe up to background Safari, or lock the screen. Playback should continue.

Limitations

- Playback will not continue if the user force-quits Safari.
- Some older iOS versions may not support the Media Session API; metadata will not show there but playback may still continue.
