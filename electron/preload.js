const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Data
  loadData:       ()                => ipcRenderer.invoke('data:load'),
  saveData:       (d)               => ipcRenderer.invoke('data:save', d),
  getDataPath:    ()                => ipcRenderer.invoke('app:get-data-path'),
  openDataDir:    ()                => ipcRenderer.invoke('app:open-data-dir'),

  // Set data dir (renderer picks path via built-in browser, sends string)
  setDataDir:     (dir, data)       => ipcRenderer.invoke('app:set-data-dir', dir, data),

  // Export / import (renderer provides paths)
  exportData:     (data, destDir)   => ipcRenderer.invoke('data:export', data, destDir),
  exportSop:      (sop, savePath)   => ipcRenderer.invoke('data:export-sop', sop, savePath),
  importData:     (filePath)        => ipcRenderer.invoke('data:import', filePath),

  // File system browsing (for in-app path picker)
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
  onExternalChange:             (cb) => ipcRenderer.on('data:external-change', (_,d) => cb(d)),
  removeExternalChangeListener: ()   => ipcRenderer.removeAllListeners('data:external-change'),
})
