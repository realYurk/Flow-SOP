const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs   = require('fs')
const os   = require('os')
const { exportToFolder, sopToMarkdown } = require('./sopFormat')

const isDev = !app.isPackaged

// ── Data directory strategy ───────────────────────────────────────────────────
// 1. If portable config exists next to exe → use that (portable mode)
// 2. Otherwise → use ~/.flowsop (default)
// User can change via in-app settings, stored in config.json

function getAppDir() {
  // In production, app.getPath('exe') is the installed exe location
  if (!isDev) {
    try { return path.dirname(app.getPath('exe')) } catch(e){}
  }
  return path.join(os.homedir(), '.flowsop')
}

const CONFIG_DIR  = path.join(os.homedir(), '.flowsop')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

function readConfig() {
  try { if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE,'utf-8')) }
  catch(e) {}
  return {}
}
function writeConfig(cfg) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR,{recursive:true})
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg,null,2),'utf-8')
}
function getDataDir()  {
  return readConfig().dataDir || path.join(os.homedir(), '.flowsop')
}
function getDataFile() { return path.join(getDataDir(),'data.json') }
function ensureDataDir() {
  const d = getDataDir()
  if (!fs.existsSync(d)) fs.mkdirSync(d,{recursive:true})
}

function loadData() {
  ensureDataDir()
  const f = getDataFile()
  if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify(require('./seed.js'),null,2),'utf-8')
  return JSON.parse(fs.readFileSync(f,'utf-8'))
}
function saveData(d) {
  ensureDataDir()
  fs.writeFileSync(getDataFile(), JSON.stringify(d,null,2),'utf-8')
}

// ── Window ────────────────────────────────────────────────────────────────────
let mainWindow = null
let watcher    = null

function startWatcher() {
  if (watcher) { try { watcher.close() } catch(e){} }
  ensureDataDir()
  const f = getDataFile()
  if (!fs.existsSync(f)) return
  watcher = fs.watch(f,{persistent:false},(evt) => {
    if (evt==='change' && mainWindow) {
      try { mainWindow.webContents.send('data:external-change',
              JSON.parse(fs.readFileSync(f,'utf-8'))) } catch(e){}
    }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width:1440, height:900, minWidth:1000, minHeight:660,
    backgroundColor:'#0f0f17',
    titleBarStyle: process.platform==='darwin' ? 'hiddenInset' : 'hidden',
    frame: false,
    webPreferences:{
      preload: path.join(__dirname,'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    }
  })
  if (isDev) mainWindow.loadURL('http://localhost:5173')
  else       mainWindow.loadFile(path.join(__dirname,'../dist/index.html'))
  mainWindow.on('closed', () => { mainWindow = null })
}

// ── IPC ───────────────────────────────────────────────────────────────────────
ipcMain.handle('data:load',         ()    => loadData())
ipcMain.handle('data:save',         (_,d) => { saveData(d); return true })
ipcMain.handle('app:get-data-path', ()    => getDataFile())
ipcMain.handle('app:open-data-dir', ()    => shell.openPath(getDataDir()))
ipcMain.handle('app:minimize',      ()    => mainWindow?.minimize())
ipcMain.handle('app:maximize',      ()    => {
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize()
})
ipcMain.handle('app:close', () => mainWindow?.close())

// 更改数据目录 — 接收来自渲染进程的路径字符串（前端用自定义输入框选路径）
ipcMain.handle('app:set-data-dir', (_, newDir, currentData) => {
  try {
    if (!newDir || typeof newDir !== 'string') return { ok:false, msg:'路径无效' }
    if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, {recursive:true})
    const newFile = path.join(newDir, 'data.json')
    fs.writeFileSync(newFile, JSON.stringify(currentData,null,2), 'utf-8')
    writeConfig({ ...readConfig(), dataDir: newDir })
    startWatcher()
    return { ok:true, path: newFile }
  } catch(e) {
    return { ok:false, msg: String(e) }
  }
})

// 导出全部 — 接收前端传来的目标目录路径
ipcMain.handle('data:export', (_, d, destParent) => {
  try {
    const base    = destParent || path.join(os.homedir(), '.flowsop', 'exports')
    const destDir = path.join(base, 'flow-sop-export')
    exportToFolder(d, destDir)
    shell.openPath(destDir)
    return { status:'ok', path: destDir }
  } catch(e) {
    return { status:'error', message: String(e) }
  }
})

// 导出单个 SOP — 接收前端传来的保存路径
ipcMain.handle('data:export-sop', (_, sopData, savePath) => {
  try {
    const p = savePath || path.join(os.homedir(), '.flowsop', 'exports',
      (sopData.title||'sop').replace(/[/\\?%*:|"<>]/g,'-').replace(/\s+/g,'_')+'.md')
    const dir = path.dirname(p)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true})
    fs.writeFileSync(p, sopToMarkdown(sopData), 'utf-8')
    shell.showItemInFolder(p)
    return { status:'ok', path: p }
  } catch(e) {
    return { status:'error', message: String(e) }
  }
})

// 导入 — 接收前端传来的文件路径
ipcMain.handle('data:import', (_, filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath,'utf-8'))
  } catch(e) { return null }
})

// 读取目录内容（用于前端文件浏览器）
ipcMain.handle('fs:readdir', (_, dirPath) => {
  try {
    const entries = fs.readdirSync(dirPath, {withFileTypes:true})
    return entries.map(e => ({
      name: e.name,
      isDir: e.isDirectory(),
      path: path.join(dirPath, e.name),
    }))
  } catch(e) { return [] }
})

// 获取驱动器列表（Windows）/ 根目录（其他）
ipcMain.handle('fs:roots', () => {
  if (process.platform === 'win32') {
    const drives = []
    for (let i = 65; i <= 90; i++) {
      const d = String.fromCharCode(i) + ':\\'
      if (fs.existsSync(d)) drives.push({ name: d, path: d, isDir:true })
    }
    return drives
  }
  return [{ name:'/', path:'/', isDir:true }]
})

ipcMain.handle('fs:homedir', () => os.homedir())
ipcMain.handle('fs:pathsep', () => path.sep)
ipcMain.handle('fs:join',    (_, ...parts) => path.join(...parts))

// ── App lifecycle ──────────────────────────────────────────────────────────────
app.whenReady().then(() => { createWindow(); startWatcher() })
app.on('window-all-closed', () => {
  if (watcher) { try { watcher.close() } catch(e){} }
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => { if (BrowserWindow.getAllWindows().length===0) createWindow() })
