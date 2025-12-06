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
- The audio files are referenced by path under /music/ in the app. When deployed to gh-pages, GitHub Pages will serve public/ files at the repository root path, with the site usually available at https://<user>.github.io/<repo>/.
