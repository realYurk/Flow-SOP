const { contextBridge, ipcRenderer } = require('electron')

// Strip Vue Proxy wrapper — IPC structured clone cannot handle Proxy objects
function raw(obj) {
  return JSON.parse(JSON.stringify(obj))
}

contextBridge.exposeInMainWorld('electronAPI', {
  // Data
  loadData:       ()                => ipcRenderer.invoke('data:load'),
  saveData:       (d)               => ipcRenderer.invoke('data:save', raw(d)),
  getDataPath:    ()                => ipcRenderer.invoke('app:get-data-path'),
  openDataDir:    ()                => ipcRenderer.invoke('app:open-data-dir'),

  // Change data dir (send plain data so it can be written to new location)
  setDataDir:     (dir, data)       => ipcRenderer.invoke('app:set-data-dir', dir, raw(data)),

  // Export / import — always strip Proxy before sending
  exportData:     (data, destDir)   => ipcRenderer.invoke('data:export',     raw(data), destDir),
  exportSop:      (sop,  savePath)  => ipcRenderer.invoke('data:export-sop', raw(sop),  savePath),
  importData:     (filePath)        => ipcRenderer.invoke('data:import',      filePath),

  // File system browsing
  fsReaddir:      (p)               => ipcRenderer.invoke('fs:readdir', p),
  fsRoots:        ()                => ipcRenderer.invoke('fs:roots'),
  fsHomedir:      ()                => ipcRenderer.invoke('fs:homedir'),
  fsPathsep:      ()                => ipcRenderer.invoke('fs:pathsep'),
  fsJoin:         (...parts)        => ipcRenderer.invoke('fs:join', ...parts),

  // Window controls
  minimize:       ()                => ipcRenderer.invoke('app:minimize'),
  maximize:       ()                => ipcRenderer.invoke('app:maximize'),
  close:          ()                => ipcRenderer.invoke('app:close'),

  // File watcher
  onExternalChange:             (cb) => ipcRenderer.on('data:external-change', (_, d) => cb(d)),
  removeExternalChangeListener: ()   => ipcRenderer.removeAllListeners('data:external-change'),
})
