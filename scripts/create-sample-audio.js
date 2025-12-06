const fs = require('fs');
const path = require('path');

function writeWav(filePath, freq = 440, durationSec = 1, sampleRate = 44100) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const bytesPerSample = 2; // 16-bit
  const blockAlign = bytesPerSample * 1; // mono
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const chunkSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(chunkSize, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;

  // fmt subchunk
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4; // subchunk1Size
  buffer.writeUInt16LE(1, offset); offset += 2; // audioFormat (1 = PCM)
  buffer.writeUInt16LE(1, offset); offset += 2; // numChannels
  buffer.writeUInt32LE(sampleRate, offset); offset += 4; // sampleRate
  buffer.writeUInt32LE(byteRate, offset); offset += 4; // byteRate
  buffer.writeUInt16LE(blockAlign, offset); offset += 2; // blockAlign
  buffer.writeUInt16LE(16, offset); offset += 2; // bitsPerSample

  // data subchunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  const amplitude = 0.5 * 0x7fff;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.round(amplitude * Math.sin(2 * Math.PI * freq * t));
    buffer.writeInt16LE(sample, offset);
    offset += 2;
  }

  fs.writeFileSync(filePath, buffer);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const musicDir = path.join(__dirname, '..', 'public', 'music', 'Sample Songs');
  ensureDir(musicDir);

  const f1 = path.join(musicDir, 'happy-unicorn.wav');
  const f2 = path.join(musicDir, 'sparkle-dance.wav');

  console.log('Generating sample audio files:');
  writeWav(f1, 440, 1.2);
  console.log(' -', f1);
  writeWav(f2, 660, 1.0);
  console.log(' -', f2);
  console.log('Done. You can run `npm run generate-manifest` to include them in the manifest.');
}

if (require.main === module) main();
