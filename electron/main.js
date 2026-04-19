const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs   = require('fs')
const os   = require('os')
const { exportToFolder, sopToMarkdown } = require('./sopFormat')

const isDev = !app.isPackaged

// ── Config ────────────────────────────────────────────────────────────────────
const CONFIG_DIR  = path.join(os.homedir(), '.flowsop')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

function readConfig() {
  try { if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) }
  catch (e) {}
  return {}
}
function writeConfig(cfg) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8')
}
function getDataDir()  { return readConfig().dataDir || CONFIG_DIR }
function getDataFile() { return path.join(getDataDir(), 'data.json') }
function ensureDataDir() {
  const d = getDataDir()
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
}

function loadData() {
  ensureDataDir()
  const f = getDataFile()
  if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify(require('./seed.js'), null, 2), 'utf-8')
  return JSON.parse(fs.readFileSync(f, 'utf-8'))
}
function saveData(d) {
  ensureDataDir()
  fs.writeFileSync(getDataFile(), JSON.stringify(d, null, 2), 'utf-8')
}

// ── Window ────────────────────────────────────────────────────────────────────
let mainWindow = null
let watcher    = null

function startWatcher() {
  if (watcher) { try { watcher.close() } catch (e) {} }
  ensureDataDir()
  const f = getDataFile()
  if (!fs.existsSync(f)) return
  watcher = fs.watch(f, { persistent: false }, (evt) => {
    if (evt === 'change' && mainWindow) {
      try { mainWindow.webContents.send('data:external-change', JSON.parse(fs.readFileSync(f, 'utf-8'))) }
      catch (e) {}
    }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1000, minHeight: 660,
    backgroundColor: '#0f0f17',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    }
  })
  if (isDev) mainWindow.loadURL('http://localhost:5173')
  else       mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  mainWindow.on('closed', () => { mainWindow = null })
}

// ── IPC ───────────────────────────────────────────────────────────────────────
ipcMain.handle('data:load',         ()     => loadData())
ipcMain.handle('data:save',         (_, d) => { saveData(d); return true })
ipcMain.handle('app:get-data-path', ()     => getDataFile())
ipcMain.handle('app:open-data-dir', ()     => shell.openPath(getDataDir()))
ipcMain.handle('app:minimize',      ()     => mainWindow?.minimize())
ipcMain.handle('app:maximize',      ()     => { mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize() })
ipcMain.handle('app:close',         ()     => mainWindow?.close())

// ── 更改数据目录 ───────────────────────────────────────────────────────────────
ipcMain.handle('app:set-data-dir', (_, newDir, currentData) => {
  try {
    if (!newDir || typeof newDir !== 'string') return { ok: false, msg: '路径无效' }
    // Create dir if not exists
    if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true })
    const newFile = path.join(newDir, 'data.json')
    // Write current data to new location
    fs.writeFileSync(newFile, JSON.stringify(currentData, null, 2), 'utf-8')
    // Save config so next launch uses new dir
    writeConfig({ ...readConfig(), dataDir: newDir })
    // Restart watcher on new file
    startWatcher()
    return { ok: true, path: newFile }
  } catch (e) {
    return { ok: false, msg: String(e) }
  }
})

// ── 导出全部数据 → 用户选择的目标文件夹 ────────────────────────────────────────
ipcMain.handle('data:export', (_, d, destParent) => {
  try {
    if (!destParent) return { status: 'error', message: '未指定导出目录' }
    // Create parent if needed
    if (!fs.existsSync(destParent)) fs.mkdirSync(destParent, { recursive: true })
    const destDir = path.join(destParent, 'flow-sop-export')
    exportToFolder(d, destDir)
    // Open the folder in explorer
    shell.openPath(destDir)
    return { status: 'ok', path: destDir }
  } catch (e) {
    return { status: 'error', message: String(e) }
  }
})

// ── 导出单个 SOP 为 Markdown → 用户指定完整文件路径 ────────────────────────────
ipcMain.handle('data:export-sop', (_, sopData, savePath) => {
  try {
    if (!savePath) return { status: 'error', message: '未指定保存路径' }
    const dir = path.dirname(savePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const content = sopToMarkdown(sopData)
    fs.writeFileSync(savePath, content, 'utf-8')
    // Show file in explorer/finder
    shell.showItemInFolder(savePath)
    return { status: 'ok', path: savePath }
  } catch (e) {
    return { status: 'error', message: String(e) }
  }
})

// ── 导入数据 ──────────────────────────────────────────────────────────────────
ipcMain.handle('data:import', (_, filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch (e) {
    return null
  }
})

// ── 文件系统浏览（用于内置文件夹选择器）──────────────────────────────────────
ipcMain.handle('fs:readdir', (_, dirPath) => {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    return entries
      .filter(e => {
        // Skip hidden files and system dirs on Windows
        if (e.name.startsWith('.')) return false
        if (process.platform === 'win32' && ['$Recycle.Bin','System Volume Information','Recovery','Config.Msi'].includes(e.name)) return false
        return true
      })
      .map(e => ({
        name: e.name,
        isDir: e.isDirectory(),
        path: path.join(dirPath, e.name),
      }))
  } catch (e) {
    return []
  }
})

// ── 获取所有驱动器/根目录 ──────────────────────────────────────────────────────
ipcMain.handle('fs:roots', () => {
  if (process.platform === 'win32') {
    // Use wmic to get real drive list (more reliable than existsSync loop)
    try {
      const { execSync } = require('child_process')
      const out = execSync('wmic logicaldisk get name', { encoding: 'utf-8', timeout: 3000 })
      const drives = out.split('\n')
        .map(l => l.trim())
        .filter(l => /^[A-Z]:$/.test(l))
        .map(d => ({ name: d + '\\', path: d + '\\', isDir: true }))
      if (drives.length > 0) return drives
    } catch (e) {}
    // Fallback: scan A-Z
    const drives = []
    for (let i = 65; i <= 90; i++) {
      const d = String.fromCharCode(i) + ':\\'
      try { if (fs.existsSync(d)) drives.push({ name: d, path: d, isDir: true }) } catch (e) {}
    }
    return drives
  }
  // macOS/Linux: show home + /
  return [
    { name: '/', path: '/', isDir: true },
    { name: '~/Desktop', path: path.join(os.homedir(), 'Desktop'), isDir: true },
    { name: '~/Documents', path: path.join(os.homedir(), 'Documents'), isDir: true },
    { name: os.homedir(), path: os.homedir(), isDir: true },
  ].filter(e => fs.existsSync(e.path))
})

ipcMain.handle('fs:homedir', () => os.homedir())
ipcMain.handle('fs:pathsep', () => path.sep)
ipcMain.handle('fs:join',    (_, ...parts) => path.join(...parts))

// ── App lifecycle ──────────────────────────────────────────────────────────────
app.whenReady().then(() => { createWindow(); startWatcher() })
app.on('window-all-closed', () => {
  if (watcher) { try { watcher.close() } catch (e) {} }
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
