export interface ActionCard {
  id: string; title: string; language: string
  code: string; notes: string; completed: boolean; sortOrder: number; pinned?: boolean
}
export interface SopItem {
  id: string; title: string; mermaidSource: string
  variables: Record<string, string>; actionCards: ActionCard[]
  sortOrder: number; pinnedCardIds?: string[]
}
export interface Folder   { id: string; name: string; sortOrder: number; sopItems: SopItem[] }
export interface Collection { id: string; name: string; icon: string; color: string; sortOrder: number; folders: Folder[] }
export interface AppData  { collections: Collection[] }
export interface Toast    { id: string; message: string; type: 'success'|'error'|'info' }
export interface ExportResult { status: 'ok'|'cancelled'|'error'; path?: string; message?: string }
export interface FsEntry  { name: string; isDir: boolean; path: string }

export interface ElectronAPI {
  loadData:    () => Promise<AppData>
  saveData:    (d: AppData) => Promise<boolean>
  getDataPath: () => Promise<string>
  openDataDir: () => Promise<void>
  setDataDir:  (dir: string, data: AppData) => Promise<{ ok: boolean; path?: string; msg?: string } | null>
  exportData:  (data: AppData, destDir: string) => Promise<ExportResult>
  exportSop:   (sop: SopItem, savePath: string) => Promise<ExportResult>
  importData:  (filePath: string) => Promise<AppData | null>
  fsReaddir:   (p: string) => Promise<FsEntry[]>
  fsRoots:     () => Promise<FsEntry[]>
  fsHomedir:   () => Promise<string>
  fsPathsep:   () => Promise<string>
  fsJoin:      (...parts: string[]) => Promise<string>
  minimize:    () => Promise<void>
  maximize:    () => Promise<void>
  close:       () => Promise<void>
  onExternalChange:             (cb: (data: AppData) => void) => void
  removeExternalChangeListener: () => void
}
declare global { interface Window { electronAPI?: ElectronAPI } }
