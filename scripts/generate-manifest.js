const fs = require('fs');
const path = require('path');

const musicRoot = path.join(__dirname, '..', 'public', 'music');
const outFile = path.join(__dirname, '..', 'public', 'manifest.json');

function isAudioFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(ext);
}

function scanFolder(folderPath, relPath = '') {
  const entries = fs.existsSync(folderPath) ? fs.readdirSync(folderPath, { withFileTypes: true }) : [];
  const folders = [];
  const songs = [];

  for (const e of entries) {
    if (e.isDirectory()) {
      const child = scanFolder(path.join(folderPath, e.name), path.join(relPath, e.name));
      folders.push({ name: e.name, path: path.join(relPath, e.name).replace(/\\/g, '/'), ...child });
    } else if (e.isFile() && isAudioFile(e.name)) {
      songs.push({ name: e.name, file: path.join(relPath, e.name).replace(/\\/g, '/') });
    }
  }

  // sort folders and songs alphabetically
  folders.sort((a,b)=>a.name.localeCompare(b.name));
  songs.sort((a,b)=>a.name.localeCompare(b.name));

  return { folders, songs };
}

function buildManifest() {
  const manifest = { root: { name: 'music', path: '', ...scanFolder(musicRoot, '') } };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Wrote manifest to', outFile);
}

if (require.main === module) {
  try {
    buildManifest();
  } catch (err) {
    console.error('Error generating manifest:', err);
    process.exit(1);
  }
}
