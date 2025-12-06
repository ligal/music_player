import React, { useEffect, useState, useRef } from 'react';
import './App.css';

function FolderTree({ node, onSelectFolder }) {
  return (
    <div className="folder-tree">
      <div className="folder-node" onClick={() => onSelectFolder(node)}>
        📁 {node.name}
      </div>
      <div className="folder-children">
        {node.folders && node.folders.map(f => (
          <FolderTree key={f.path} node={f} onSelectFolder={onSelectFolder} />
        ))}
      </div>
    </div>
  );
}

function SongList({ songs, onPlay }) {
  if (!songs || songs.length === 0) return <div className="empty">No songs in this folder</div>;
  return (
    <ul className="song-list">
      {songs.map((s, idx) => (
        <li key={s.file} onClick={() => onPlay(idx)}>
          🎵 {s.name}
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [manifest, setManifest] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [fetchLog, setFetchLog] = useState([]);
  const [showDebug, setShowDebug] = useState(true);
  const audioRef = useRef(null);

  // PUBLIC_URL-aware base (works when app is served from a subpath)
  const publicUrlBase = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

  useEffect(() => {
    let canceled = false;
    async function loadManifest() {
      try {
        // Try a few locations. When the app is hosted at a subpath (PUBLIC_URL),
        // the manifest will be available at PUBLIC_URL + '/manifest.json'.
        const candidates = [
          publicUrlBase ? publicUrlBase + '/manifest.json' : '/manifest.json',
          '/manifest.json',
          'manifest.json'
        ];
        let m = null;
        for (const url of candidates) {
          try {
            const res = await fetch(url + '?_=' + Date.now());
            const entry = { url, ok: res.ok, status: res.status };
            if (!res.ok) {
              entry.body = await res.text().catch(() => '<no body>');
              setFetchLog(prev => [...prev, entry]);
              continue;
            }
            // try parse
            const text = await res.text();
            entry.body = text.slice(0, 1000);
            setFetchLog(prev => [...prev, entry]);
            m = JSON.parse(text);
            break;
          } catch (e) {
            setFetchLog(prev => [...prev, { url, error: String(e) }]);
            continue;
          }
        }
        if (!m) throw new Error('manifest.json not found (checked PUBLIC_URL + /manifest.json, /manifest.json and manifest.json)');
        if (canceled) return;
        setManifest(m);
        setCurrentFolder(m.root);
      } catch (err) {
        console.error('Could not load manifest', err);
        setManifest({ error: String(err) });
      }
    }
    loadManifest();
    return () => { canceled = true; };
  }, [publicUrlBase]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      if (!currentFolder || currentIndex == null) return;
      const next = currentIndex + 1;
      if (next < (currentFolder.songs ? currentFolder.songs.length : 0)) {
        setCurrentIndex(next);
        audio.src = (publicUrlBase ? publicUrlBase + '/music/' : '/music/') + currentFolder.songs[next].file;
        audio.play().catch(() => {});
      } else {
        setCurrentIndex(null);
        audio.src = '';
      }
    };
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [currentFolder, currentIndex, publicUrlBase]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentFolder && currentIndex != null) {
      audio.src = (publicUrlBase ? publicUrlBase + '/music/' : '/music/') + currentFolder.songs[currentIndex].file;
      audio.play().catch(() => {});
    }
  }, [currentFolder, currentIndex, publicUrlBase]);

  function handleSelectFolder(folder) {
    setCurrentFolder(folder);
    setCurrentIndex(null);
  }

  function handlePlay(index) {
    setCurrentIndex(index);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Unicorn Music Player</h1>
        <p>Joyful, child-friendly tunes</p>
      </header>
      <main className="app-main">
        <aside className="sidebar">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <strong>Folders</strong>
            <button onClick={() => setShowDebug(s => !s)} style={{fontSize:12}}>{showDebug? 'Hide' : 'Show'} debug</button>
          </div>
          {manifest ? (
            manifest.error ? (
              <div className="empty">Error loading folders: {manifest.error} <div style={{marginTop:8}}><button onClick={() => window.location.reload()}>Reload</button></div></div>
            ) : (
              <FolderTree node={manifest.root} onSelectFolder={handleSelectFolder} />
            )
          ) : (
            <div>Loading folders...</div>
          )}

          {showDebug && (
            <div style={{marginTop:12}}>
              <details open>
                <summary style={{cursor:'pointer'}}>Fetch debug</summary>
                <div style={{maxHeight:220, overflow:'auto', fontSize:12}}>
                  {fetchLog.length === 0 && <div className="empty">No fetch attempts yet</div>}
                  {fetchLog.map((f, i) => (
                    <div key={i} style={{padding:6, borderBottom:'1px dashed rgba(0,0,0,0.05)'}}>
                      <div><strong>URL:</strong> {f.url || '(error)'}</div>
                      {f.error && <div style={{color:'crimson'}}><strong>Error:</strong> {f.error}</div>}
                      {f.status != null && <div><strong>Status:</strong> {f.status} {f.ok? 'OK': ''}</div>}
                      {f.body && <div style={{whiteSpace:'pre-wrap', marginTop:6}}>{f.body}</div>}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </aside>
        <section className="content">
          <div className="unicorn-hero">Your unicorn art goes here (replace later)</div>
          <div className="folder-info">
            {currentFolder ? <h2>Folder: {currentFolder.name}</h2> : <h2>Select a folder</h2>}
          </div>
          <SongList songs={currentFolder?.songs} onPlay={handlePlay} />
          <div className="player-controls">
            <audio ref={audioRef} controls />
            {currentIndex != null && currentFolder && (
              <div className="now-playing">Now playing: {currentFolder.songs[currentIndex].name}</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
